const { randomBytes } = require('crypto');
const fs = require('fs');
const QRCode = require('qrcode');
const base32 = require('base32');

async function main () {
    await encodeDataToQrcodes(Buffer.from(randomBytes(100)));
    await encodeDataToQrcodes(Buffer.from(randomBytes(200)));
    await encodeDataToQrcodes(Buffer.from(randomBytes(500)));
}

async function encodeDataToQrcodes (data) {
    await encodeDataToQrcode(data, "alphanumeric-base32");
    await encodeDataToQrcode(data, "byte");
    await encodeDataToQrcode(data, "byte-base64");
}

async function encodeDataToQrcode (data, mode) {
    let input;
    let qrcodemode;
    if (mode === "alphanumeric-base32") {
        qrcodemode = "alphanumeric";
        input = base32.encode(data).toUpperCase()
    }
    else if (mode === "byte") {
        input = data;
    }
    else if (mode === "byte-base64") {
        input = data.toString('base64');
    }

    result = await QRCode.toBuffer([
        {
          data: input,
          mode: qrcodemode,
        },
    ]);
    
    await fs.promises.writeFile(`examples/qrcode-${mode}-${data.length}.png`, result);
}

main();
