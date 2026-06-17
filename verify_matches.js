const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const dirPath = 'G:\\بلو لووك\\350';

const matches = {
    '0497b5d2-7de4-4936-bd1d-de2e1569a346.jpg': { x: 101, y: 1202 },
    '10jpg.jpg': { x: 181, y: 62 },
    '11.jpg': { x: 61, y: 1129 },
    '12.jpg': { x: 589, y: 1160 },
    '13.jpg': { x: 75, y: 1161 },
    '14.jpg': { x: 745, y: 137 },
    '15.jpg': { x: 194, y: 78 },
    '16.jpg': { x: 50, y: 78 },
    '17.jpg': { x: 146, y: 65 },
    '18.jpg': { x: 98, y: 1162 },
    '2.jpg': { x: 686, y: 52 },
    '3.jpg': { x: 683, y: 1058 },
    '4.jpg': { x: 628, y: 141 },
    '5.jpg': { x: 26, y: 83 },
    '6.jpg': { x: 28, y: 521 },
    '7.jpg': { x: 704, y: 1069 },
    '8.jpg': { x: 591, y: 1151 },
    '9.jpg': { x: 599, y: 24 }
};

async function main() {
    for (const [file, pos] of Object.entries(matches)) {
        const filePath = path.join(dirPath, file);
        const img = await Jimp.read(filePath);
        const width = img.bitmap.width;
        const height = img.bitmap.height;

        console.log(`\n========================================`);
        console.log(`FILE: ${file} at match (${pos.x}, ${pos.y})`);
        console.log(`========================================`);

        // We will print rows y from pos.y + 9 to pos.y + 16 (height of letters)
        // and columns x from pos.x + 26 to pos.x + 72 (width of "@d.okz")
        // In the template X=65 was cropX, and "@d.okz" was roughly from X=91 to 142 (offset +26 to +77).
        // Let's print from offset +20 to +77, and Y offset +5 to +18.
        const startX = pos.x + 20;
        const endX = pos.x + 77;
        const startY = pos.y + 5;
        const endY = pos.y + 18;

        for (let y = startY; y < endY; y++) {
            let line = '';
            for (let x = startX; x < endX; x++) {
                const idx = (y * width + x) * 4;
                const r = img.bitmap.data[idx];
                const g = img.bitmap.data[idx + 1];
                const b = img.bitmap.data[idx + 2];
                const brightness = (r + g + b) / 3;
                
                if (brightness > 220) {
                    line += '#';
                } else if (brightness > 120) {
                    line += '+';
                } else if (brightness > 60) {
                    line += '.';
                } else {
                    line += ' ';
                }
            }
            console.log(`${String(y - pos.y).padStart(2, '0')}: ${line}`);
        }
    }
}

main();
