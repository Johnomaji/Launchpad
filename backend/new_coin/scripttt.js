const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');
const { Transaction } = require('@mysten/sui/transactions');

const newCoin = (name, symbol, iconUrl, description) => {
    // Replace spaces with underscores and convert to lowercase
    name = name.replace(" ", "_").toLowerCase();
    symbol = symbol.toUpperCase();
    
    const rootPath = process.cwd();
    console.log(rootPath);
    const packagePath = path.join(rootPath, `${name}/`);

    console.log(packagePath);

    execSync(`sui move new ${name}`);
    // execSync(`sui move build --path ./${name}`);

    const templatePath = path.join(rootPath, "new_coin", "template.txt");
    let fileContent = fs.readFileSync(templatePath, "utf8");
    fileContent = fileContent.replace("template_description", description);
    fileContent = fileContent.replace(/TEMPLATE/g, symbol);
    fileContent = fileContent.replace("Template", name.charAt(0).toUpperCase() + name.slice(1));
    fileContent = fileContent.replace(/template/g, name);

    console.log(fileContent);
    fs.writeFileSync(path.join(rootPath, `${name}/sources/${name}.move`), fileContent);

    const { modules, dependencies } = JSON.parse(
        execSync(`sui move build --path ${packagePath} --install-dir ./${name}`, {
            encoding: 'utf-8',
        }),
    );
    
    const tx = new Transaction();
    const cap = tx.publish({
        modules,
        dependencies,
    });

    // Transfer the upgrade capability to the sender so they can upgrade the package later
    tx.moveCall({
        target: "0x2::package::make_immutable",
        arguments: [
            cap,
        ]
    });

    console.log(tx);
    
    return tx;
}

newCoin("abuja", "ABUJA", "http://somewhere.com", "A better version of Naira");	
