/**
 * v101.0「仙途传说」— 故事剧情片段
 * 在关键里程碑时展示西游记相关剧情
 */

export interface StoryEntry {
  id: string;
  trigger: { type: 'level' | 'chapter' | 'reincarnation' | 'realm'; value: number };
  title: string;
  text: string;
  reward?: { type: 'lingshi' | 'pantao' | 'exp'; amount: number };
}

export const STORIES: StoryEntry[] = [
  // 初始阶段
  {
    id: 'birth',
    trigger: { type: 'level', value: 1 },
    title: '石破天惊',
    text: '花果山顶，一块仙石受天地精华滋养万年，终于在一个雷电交加的夜晚炸裂开来。金光冲天，照耀四方。一只石猴从中跃出，双目放射金光，直冲斗府……',
    reward: { type: 'lingshi', amount: 100 },
  },
  {
    id: 'waterfall',
    trigger: { type: 'level', value: 10 },
    title: '水帘洞天',
    text: '群猴之中，唯有你敢跃入瀑布。穿过水幕，别有洞天。花果齐聚、石椅石桌，好一个世外桃源。群猴拜服，尊你为王——美猴王！',
    reward: { type: 'lingshi', amount: 500 },
  },
  {
    id: 'puti',
    trigger: { type: 'level', value: 30 },
    title: '拜师学艺',
    text: '漂洋过海，你来到灵台方寸山，斜月三星洞。菩提祖师观你骨骼清奇，收你为徒，赐名"悟空"。从此苦练七十二般变化，一个筋斗十万八千里！',
    reward: { type: 'exp', amount: 5000 },
  },
  {
    id: 'jingu',
    trigger: { type: 'level', value: 50 },
    title: '定海神针',
    text: '你闯入东海龙宫，千般兵器无一趁手。直到那根定海神针——如意金箍棒！重一万三千五百斤，能大能小随心如意。龙王色变，你却笑着将它缩成绣花针别在耳后。',
    reward: { type: 'lingshi', amount: 2000 },
  },
  {
    id: 'havoc',
    trigger: { type: 'level', value: 100 },
    title: '大闹天宫',
    text: '弼马温？区区养马的官职！你怒而反下天庭。十万天兵天将挡不住你一根棍子，哪吒三太子、四大天王统统败退。玉帝震怒，如来佛祖亲自出手……',
    reward: { type: 'pantao', amount: 50 },
  },
  {
    id: 'wuxingshan',
    trigger: { type: 'level', value: 200 },
    title: '五行山下',
    text: '五百年，寒来暑往。五行山压在背上，你看过无数春花秋月。直到那一天，一个僧人牵着白马路过——"你可愿随我西行？"',
    reward: { type: 'pantao', amount: 100 },
  },
  {
    id: 'journey_start',
    trigger: { type: 'level', value: 300 },
    title: '踏上西行路',
    text: '金箍虽紧，却挡不住你的一腔豪情。师徒四人一马，向着西天雷音寺进发。十万八千里，九九八十一难，每一步都是修行。',
    reward: { type: 'lingshi', amount: 10000 },
  },
  {
    id: 'huoyanshan',
    trigger: { type: 'level', value: 500 },
    title: '火焰山之战',
    text: '八百里火焰，寸草不生。三借芭蕉扇的故事在三界传为佳话——你的机智与勇猛，连铁扇公主也不得不叹服。',
    reward: { type: 'pantao', amount: 200 },
  },
  {
    id: 'lingshan',
    trigger: { type: 'level', value: 1000 },
    title: '灵山悟道',
    text: '历经千难万险，灵山近在咫尺。如来佛祖端坐莲台，微笑道："悟空，你可知这一路上最大的敌人是谁？"你沉默许久："是我自己的心魔。"',
    reward: { type: 'pantao', amount: 500 },
  },
  {
    id: 'buddhahood',
    trigger: { type: 'level', value: 2000 },
    title: '斗战胜佛',
    text: '功德圆满，你被封为"斗战胜佛"。金箍自行脱落，化作一道金光消散。你抬手摸了摸光秃秃的额头，笑了。从石猴到佛，这条路……值了。',
    reward: { type: 'lingshi', amount: 100000 },
  },
  // 转世剧情
  {
    id: 'reinc_1',
    trigger: { type: 'reincarnation', value: 1 },
    title: '轮回之始',
    text: '证道之后，你望着三界众生，忽然明悟——真正的大道不止一条。你选择放下一切，重入轮回。这一次，你不再是那只石猴，但体内那股不屈的火焰，从未熄灭。',
    reward: { type: 'pantao', amount: 100 },
  },
  {
    id: 'reinc_5',
    trigger: { type: 'reincarnation', value: 5 },
    title: '五世沧桑',
    text: '五次轮回，五种人生。你做过将军、书生、渔夫、帝王……每一世都在寻找那个答案。菩提祖师的话犹在耳边："道在脚下。"',
    reward: { type: 'pantao', amount: 500 },
  },
  {
    id: 'reinc_10',
    trigger: { type: 'reincarnation', value: 10 },
    title: '十世修行',
    text: '第十次轮回开始时，三界都在震动。天道显化，一行金字浮现："大道三千，殊途同归。"你微微一笑，踏入了新的修行之路。',
    reward: { type: 'pantao', amount: 1000 },
  },
  {
    id: 'reinc_20',
    trigger: { type: 'reincarnation', value: 20 },
    title: '超越轮回',
    text: '二十世的记忆如走马灯般掠过。你站在时间之河的尽头，看到了起点——花果山上那块仙石。原来，终点就是起点。你伸出手，轻轻触碰那块石头……无尽的力量涌入体内。',
    reward: { type: 'lingshi', amount: 1000000 },
  },
];
