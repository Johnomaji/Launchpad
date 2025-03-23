const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');
const { Transaction } = require('@mysten/sui/transactions');

const newCoin = (name,symbol, iconUrl, description) => {
    // exports.newCoin = (name,symbol, iconUrl, description) => {
    // const newCoin = (name ="BROWN",symbol ="BRN", iconUrl="example.com", description="A better version of Naira") => {
    name = name.replace(" ", "_").toLowerCase();
    symbol = symbol.toUpperCase();
    const currentPath = path.join(__dirname, "/");
    execSync(`sui move new ${name}`);

    const templatePath = path.join(__dirname, "template.txt");
    let fileContent = fs.readFileSync(templatePath, "utf8");
    fileContent = fileContent.replace("template_description", description);
    fileContent = fileContent.replace(/TEMPLATE/g, symbol);
    fileContent = fileContent.replace("Template", name.charAt(0).toUpperCase() + name.slice(1))
    fileContent = fileContent.replace(/template/g, name);

    fs.writeFileSync(path.join(__dirname, `${name}/sources/${name}.move`), fileContent);

    const packagePath = path.join(__dirname, `${name}/`);
    const { modules, dependencies } = JSON.parse(
		execSync(`sui move build --dump-bytecode-as-base64 --path ${packagePath}`, {
			encoding: 'utf-8',
		}),
	);
    const tx = new Transaction();
    const cap = tx.publish({
		modules,
		dependencies,
	});

	// Transfer the upgrade capability to the sender so they can upgrade the package later if they want.
	tx.moveCall({
        target: "0x2::package::make_immutable",
        arguments: [
            cap,
        ]
    });

    return tx;
}

newCoin("abuja", "ABUJA", "http://somewhere.com", "A better version of Naira");