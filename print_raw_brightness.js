const { Jimp } = require('jimp');

async function main() {
    const img = await Jimp.read('C:\\Users\\khale\\.gemini\\antigravity\\brain\\b05cfce0-5273-4868-aeff-50150c6bd49c\\media__1781594467814.png');
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Let's print the crop X=70 to 142 (width 72), Y=98 to 115 (height 17)
    // We'll print the average RGB brightness values (0-255)
    for (let y = 98; y < 115; y++) {
        let row = '';
        for (let x = 70; x < 142; x++) {
            const idx = (y * width + x) * 4;
            const r = img.bitmap.data[idx];
            const g = img.bitmap.data[idx + 1];
            const b = img.bitmap.data[idx + 2];
            const br = Math.round((r + g + b) / 3);
            row += String(br).padStart(4, ' ');
        }
        console.log(row);
    }
}

main();
