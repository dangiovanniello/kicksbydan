import{inventory}from'./catalog.js';
const rotationIds=[1,2,3,4,5,7,8,10,11,12];
const sourceSlugs={"1": "nike-kobe-6-protro-sail", "2": "nike-kobe-6-protro-dodgers-pe", "3": "air-jordan-4-retro-sb-navy", "4": "air-jordan-3-retro-black-cat-2025", "5": "nike-kobe-4-protro-draft-day-pack-vancouver-grizzlies", "6": "nike-kobe-4-protro-draft-day-pack-milwaukee-bucks", "7": "adidas-yeezy-boost-380-covellite", "8": "adidas-yeezy-slide-black-onyx", "10": "nike-kobe-6-protro-grinch", "11": "adidas-yeezy-foam-rnnr-onyx", "12": "puma-lamelo-ball-mb02-honeycomb"};
const accents=['#6c8eb8','#5576bc','#618bb8','#7d8794','#5f9c9b','#647b96','#848c98','#6f9436','#7d8794','#b49949'];
export const shoes=rotationIds.map((id,i)=>({...inventory.find(p=>p.id===id),accent:accents[i],headline:i===0?'A DIFFERENT<br><em>ROTATION.</em>':inventory.find(p=>p.id===id).name,frameCount:36,frameBase:`/rotations/${id}`,source:'StockX',sourceURL:'https://stockx.com/'+sourceSlugs[id]}));
