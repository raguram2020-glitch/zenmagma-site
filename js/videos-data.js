/* ═══════════════════════════════════════════════════
   ZENMAGMA — videos-data.js
   ZenMagma_WisdomNest YouTube channel video catalog
═══════════════════════════════════════════════════ */

const YT_CHANNEL = {
  name: 'ZenMagma_WisdomNest',
  handle: '@zenmagma_wisdomnest',
  url: 'https://www.youtube.com/@zenmagma_wisdomnest',
  subscribeUrl: 'https://www.youtube.com/@zenmagma_wisdomnest?sub_confirmation=1',
};

const INSTAGRAM = {
  username: 'zenmagma_official',
  url: 'https://www.instagram.com/zenmagma_official/',
};

const VIDEOS = [
  { id:'zXNJZnt91DM', title:'She Was Told "Girls Can\'t Study" 😳', publishedAt:'2026-07-13T14:30:39Z' },
  { id:'d1GG5Yjsln4', title:'The Girl Who Was Forbidden to Study… But Changed the World', publishedAt:'2026-07-13T09:00:15Z' },
  { id:'sDsy3IJCDHc', title:'He Spread One Rumor… and Destroyed an Innocent Person\'s Reputation', publishedAt:'2026-07-12T09:00:34Z' },
  { id:'OYAP2Si5CLc', title:'He Found the World\'s Greatest Treasure… But It Wasn\'t Gold', publishedAt:'2026-07-11T09:00:33Z' },
  { id:'AWFhzMImxZo', title:'While Everyone Was Arguing… He Quietly Solved the Problem', publishedAt:'2026-07-10T09:00:09Z' },
  { id:'mToC8Rc3yJE', title:'Everyone Hated This Teacher… Until They Learned the Truth', publishedAt:'2026-07-09T09:00:06Z' },
  { id:'oDuTa4uRIuo', title:'He Stopped Seeking Approval… And Everything Changed', publishedAt:'2026-07-08T09:00:20Z' },
  { id:'RDGr0GPDl_Y', title:'Every Morning She Received a Letter… Until She Discovered Who Sent It', publishedAt:'2026-07-07T09:00:22Z' },
  { id:'a_AIlQuIJlc', title:'He Lied for Fun… Until No One Believed the Truth', publishedAt:'2026-07-06T09:00:37Z' },
  { id:'KGKi6FAx2Gk', title:'The Power of Letting Go', publishedAt:'2026-07-05T09:00:36Z' },
  { id:'HbXXXMjdoD8', title:'Is Reaching the Finish Line Your Biggest Mistake? | A Story About the Journey', publishedAt:'2026-07-04T09:00:14Z' },
  { id:'FWEXHEIawZM', title:'Can You Restart Your Life Today? | A Story About Time, Fear and Freedom', publishedAt:'2026-07-03T09:00:01Z' },
  { id:'MlLaYjdkPLU', title:'The Rope That Wasn\'t Holding Him | A Story About Limiting Beliefs', publishedAt:'2026-07-02T09:00:03Z' },
  { id:'L0YGKEltGHI', title:'They Fought the River for Years — Then Lost Everything in One Night', publishedAt:'2026-07-01T09:00:24Z' },
  { id:'9ypLQh2hGlc', title:'They Spent Years Fighting the Wind — Until It Took Everything They Built', publishedAt:'2026-06-30T09:00:18Z' },
  { id:'2bzTzTaPlso', title:'He Searched the World for Wonder — His Niece Found It in a Muddy Patch of Grass', publishedAt:'2026-06-29T09:00:36Z' },
  { id:'7IlCdadG7sE', title:'Can One Person Really Change Anything? | A Story That Will Shift Your Perspective', publishedAt:'2026-06-28T09:00:32Z' },
  { id:'lXa2yFJfPZ8', title:'The Day His Lucky Charm Disappeared | A Story About Hidden Strength', publishedAt:'2026-06-27T09:00:04Z' },
  { id:'hAiF4llZspU', title:'My Father Wasn\'t Holding Me Back — He Was Building My Wings', publishedAt:'2026-06-26T15:30:15Z' },
  { id:'e8IJ03mikG0', title:'She Chased It Every Night — But the Moon\'s Reflection Was Never Hers to Keep', publishedAt:'2026-06-25T15:54:41Z' },
].map(v => ({ ...v, thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, url: `https://www.youtube.com/watch?v=${v.id}` }));
