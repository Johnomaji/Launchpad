import { Injectable } from '@nestjs/common';
import { CreateCoinDto } from './dto/create-coin.dto';
import { PublishResult } from './interfaces/publish-result.interface';
import { CoinCreation } from './interfaces/coin-creation.interface';
import { SUI_NETWORKS } from './constants/sui.constants';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as toml from 'toml';
import * as tomlify from 'tomlify-j0.4';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromBase64 } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoinCreatorService {
  private readonly defaultGasBudget: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultGasBudget = this.configService.get<number>(
      'sui.defaultGasBudget',
    );
  }

  async createCoin(createCoinDto: CreateCoinDto): Promise<CoinCreation> {
    const {
      name,
      symbol,
      iconUrl,
      description,
      network = 'testnet',
    } = createCoinDto;

    if (!name || !symbol || !description) {
      throw new Error('Name, symbol, and description are required');
    }

    const sanitizedName = name.replace(/\s+/g, '_').toLowerCase();
    const sanitizedSymbol = symbol.toUpperCase();
    const uppercaseName = sanitizedName.toUpperCase();
    const capitalizedName =
      sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1);

    const rootPath = process.cwd();
    const packagePath = path.join(rootPath, `${sanitizedName}/`);

    try {
      console.log(`Creating new Sui Move project: ${sanitizedName}`);
      execSync(`sui move new ${sanitizedName}`);

      const templatePath = path.join(rootPath, 'src', 'common', 'template.txt');
      let fileContent = fs.readFileSync(templatePath, 'utf8');

      const replacements = {
        template_description: description,
        TEMPLATE: uppercaseName,
        Template: capitalizedName,
        template: sanitizedName,
      };

      Object.entries(replacements).forEach(([placeholder, replacement]) => {
        fileContent = fileContent.replace(
          new RegExp(placeholder, 'g'),
          replacement,
        );
      });

      const sourceFilePath = path.join(
        packagePath,
        'sources',
        `${sanitizedName}.move`,
      );
      fs.writeFileSync(sourceFilePath, fileContent);

      const moveTomlPath = path.join(packagePath, 'Move.toml');

      const moveTomlContent = fs.readFileSync(moveTomlPath, 'utf8');
      const parsedToml = toml.parse(moveTomlContent);

      parsedToml.dependencies = parsedToml.dependencies || {};
      parsedToml.dependencies.Sui = {
        git: 'https://github.com/MystenLabs/sui.git',
        subdir: 'crates/sui-framework/packages/sui-framework',
        rev: '9c04e1840eb5',
        override: true,
      };

      const updatedTomlContent = tomlify.toToml(parsedToml, {
        spaces: 2,
        forceBracketObjects: true,
      });

      fs.writeFileSync(moveTomlPath, updatedTomlContent);

      console.log('Building Sui Move package...');
      const { modules, dependencies } = JSON.parse(
        execSync(
          `sui move build --dump-bytecode-as-base64 --path ${packagePath} --install-dir ${packagePath}`,
          {
            encoding: 'utf-8',
          },
        ),
      );

      const tx = new Transaction();
      const cap = tx.publish({
        modules,
        dependencies,
      });

      tx.moveCall({
        target: '0x2::package::make_immutable',
        arguments: [cap],
      });

      console.log(`Coin project ${sanitizedName} created successfully!`);
      this.moveCoinFolder(sanitizedName);

      const keyPair = this.loadKeypairFromEnv();
      console.log(`Publishing ${sanitizedName} token to ${network}...`);
      const publishResult = await this.publishToNetwork(tx, keyPair, network);

      return {
        transaction: tx,
        publishResult,
        coinName: sanitizedName,
        symbol: sanitizedSymbol,
      };
    } catch (error) {
      console.error('Error creating Sui coin project:', error);
      throw error;
    }
  }

  private moveCoinFolder(sanitizedName: string): void {
    const rootPath = process.cwd();
    const sourcePath = path.join(rootPath, sanitizedName);
    const parentDir = path.dirname(rootPath);
    const targetPath = path.join(parentDir, 'move_module', sanitizedName);

    try {
      fs.mkdirSync(path.join(parentDir, 'move_module'), { recursive: true });

      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      fs.renameSync(sourcePath, targetPath);
      console.log(
        `Moved ${sanitizedName} to ${parentDir}/move_module successfully`,
      );
    } catch (error) {
      console.error(`Error moving ${sanitizedName} folder:`, error);
      throw error;
    }
  }

  private loadKeypairFromEnv(): Ed25519Keypair {
    try {
      const privateKeyB64 = this.configService.get<string>('sui.privateKey');
      if (!privateKeyB64) {
        throw new Error('SUI_PRIVATE_KEY is not configured');
      }

      const privateKeyBytes = fromBase64(privateKeyB64);
      return Ed25519Keypair.fromSecretKey(privateKeyBytes.slice(1));
    } catch (error) {
      console.error('Error loading keypair:', error);
      throw error;
    }
  }

  private async publishToNetwork(
    transaction: Transaction,
    keyPair: Ed25519Keypair,
    networkType = 'testnet',
  ): Promise<PublishResult> {
    try {
      const rpcUrl = SUI_NETWORKS[networkType] || SUI_NETWORKS.testnet;
      const client = new SuiClient({ url: rpcUrl });

      const senderAddress = keyPair.getPublicKey().toSuiAddress();
      transaction.setSender(senderAddress);
      transaction.setGasBudget(this.defaultGasBudget);

      const txBlock = await transaction.build({ client });
      const signedTx = await keyPair.signTransaction(txBlock);

      const signature = signedTx.signature;

      const response = await client.executeTransactionBlock({
        transactionBlock: txBlock,
        signature,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      if (response.effects?.status?.status === 'success') {
        const createdObjects = response.effects.created || [];
        const packageObject = createdObjects.find(
          (obj) => obj.owner === 'Immutable',
        );

        if (packageObject) {
          return {
            success: true,
            packageId: packageObject.reference.objectId,
            transactionDigest: response.digest,
            response,
          };
        }

        return {
          success: true,
          transactionDigest: response.digest,
          response,
        };
      } else {
        console.error('Transaction failed:', response.effects?.status);
        return {
          success: false,
          error: response.effects?.status,
          response,
        };
      }
    } catch (error) {
      console.error('Error publishing to network:', error);
      throw error;
    }
  }
}
