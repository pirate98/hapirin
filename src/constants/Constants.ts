import { Dimensions, Platform } from 'react-native';

export const BASE_URL = 'https://cdicom.xsrv.jp/cdi/php/';
export const API_LIST_CHARIN_HISTORY = 'HisRd1.php';
export const API_REGISTER_INF0 = 'UserUp.php';
export const API_GET_USER_INF0 = 'UserRd.php';
export const API_UPDATE_USER_INFO = 'UidUp.php';
export const API_GET_LIST_HABIT = 'HabitRd1.php';
export const API_CHARING_HABIT_TODAY = 'HisUp.php';
export const API_CHARING_HABIT_LAST_DATE = 'UcntDd.php';
export const API_CHARING_HABIT_UCNTRD = 'UcntRd.php';
export const API_CHARING_HABIT_UCNTZUP = 'UcntZup.php';
export const API_CHARING_HABIT_UCNTUP = 'UcntUp.php';
export const API_GET_INF0_HID_PREVIEW = 'HidRd.php';
export const API_GET_HisRd = 'HisRd.php';
export const API_GET_HABIT = '';
export const API_GET_UcntLd = 'UcntLd.php';
export const API_GET_HtpRd = 'HtpRd.php';
export const API_GET_HdateRd = 'HdateRd.php';
export const API_GET_HDATE_UP = 'HdateUp.php';
export const API_HABIT_UP = 'HabitUp.php';
export const API_GET_DATA_USER_WITH_ID = 'UidRd.php';
export const API_DELETE_HABIT = 'HidDel.php';
export const regexEmoji = /\uD83C\uDFF4(?:\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74)\uDB40\uDC7F|\u200D\u2620\uFE0F)|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC68(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3]))|\uD83D\uDC69\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\uD83D\uDC68(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83D\uDC69\u200D[\u2695\u2696\u2708])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC68(?:\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDB0-\uDDB3])|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDD1-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDEEB\uDEEC\uDEF4-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])|(?:[#*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEF9]|\uD83E[\uDD10-\uDD3A\uDD3C-\uDD3E\uDD40-\uDD45\uDD47-\uDD70\uDD73-\uDD76\uDD7A\uDD7C-\uDDA2\uDDB0-\uDDB9\uDDC0-\uDDC2\uDDD0-\uDDFF])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC69\uDC6E\uDC70-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD18-\uDD1C\uDD1E\uDD1F\uDD26\uDD30-\uDD39\uDD3D\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDD1-\uDDDD])/g;
export const regexJapanese = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|[&\{\}\[\]\\\/]|\u203B/g;
export const regexSpecialChar = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g;
export const regexVietnameseChar = /[ÀÁÂÃÈÉÊẾÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\\]+/g;
export const regexLatinChar = /[a-zA-Z]+/g;
export const widthScreen = Dimensions.get('window').width; //full width
export const heightScreen = Dimensions.get('window').height; //full height
export const isIpX =
  Platform.OS === 'ios' && (widthScreen > 800 || heightScreen > 800);
export const ratio = heightScreen / widthScreen >= 2 ? true : false;
export default {
  BACKGROUND_COLOR_TOOLBAR: '#c2894b',
  MODE_HEALTH: 0,
  MODE_LEARNING: 1,
  MODE_CONTRIBUTION: 2,
  MODE_ALL: 3,
  EVENT_CHANGE_SOUND: 'changeSound',
  arr_Health: [
    '顔色いいね',
    'ほっほー!ブラボー！',
    'たげかっけー（by津軽弁）',
    'がんばったね！',
    'すっごくイキイキしてる！憧れちゃう♪',
    '爽やかだね～、カッコイイ！',
    '僕もやらなきゃ・・・・',
    '継続は力なり！！！',
    'この調子で目標達成目指そう！！',
    'めっちゃ体、喜んでるで！',
    'なぜ、キミはそんなにエライんだ！',
    'がんばるって、ス・テ・キ♪',
    'カラダの細胞が喜んでるっちゃ！',
    'よ！健康長寿！！',
    '元気いっぱい。夢いっぱい。',
    'エネルギーチャージ、OK！',
    'カラダにいいと気持ちええ！',
    '理想のきみに近づいてる！',
    'からだもココロもすこやかでんな！',
    'きもちよかたい！よかたい＾＾',
    '体の中から元気が出るぜ〜',
    'きみの可能性知ってるBody！',
    'OH！ヘルシーね〜、いいね〜！',
    '君の実行力、なかなかマネできへん！',
    '免疫細胞が活性化した！',
    'からだにいいことやっちゃった♪',
    'これで、新陳代謝アップ！',
  ],
  arr_Study: [
    'できる子！',
    '尊敬です',
    'また一つ階段のぼったね、',
    'Good work ☆',
    '努力は必ず報われる',
    'タッタラー♪実行！',
    'も～、そんなにかしこなって〜',
    'がんばったね！かなえたい夢に1歩前進！',
    '継続は力なり！いいぞ、この調子♪',
    'すごいなぁ、尊敬しちゃう！',
    'さすが！努力家だね！',
    '頭、良くなったで！',
    'この調子で頑張って♪',
    '寝る前にもう一度、自分を褒めてあげてね',
    '脳のシナプスめっちゃ増えたで〜！',
    'まさかの知恵が降りてくるかも。',
    'よしよしよしよし〜〜♪♪',
    '立派に育った君に、感涙。',
    '脳のシナプス、幸せ座☆☆☆',
    'あ、脳のシワ増えたで！',
    'エラい！！きみエラすぎるわ。',
    'そんなにがんばってたら神さまがほっとかへん！',
    'あなたは偉業を成し遂げている！',
    '君はどこまで成長するつもり♪',
    '未来の君に、近づいた！',
    'がんばったね！！',
    '君の実行力、さすがだ',
  ],
  arr_Volunteer: [
    'あなたのおかげです、うるうる',
    'あなたにも幸運あ・げ・る',
    '神対応！ありがとう＾＾',
    'やさしさでキラキラしてる☆',
    'あなたに感謝します。',
    'ありがとう、ほんとに。',
    'なんでそんなに気がきくの？！',
    'よく気がついたね！優しさに乾杯！',
    'あなたにしかできないことだね。',
    '心がきれいだね。見習いたいよ！',
    '優しいなぁ、さすが！！',
    '優しい心の持ち主だ～',
    'オキシトシンパワー！！！',
    'いつも、ありがとうぶ～♪',
    'ココロがあったかいね',
    '思いやりが素敵。',
    'オキシトシンでさらに幸せ(*´∀｀*)ﾉ',
    'なぜそんなに君は優しいんだ・・！',
    'わし神様やけど、見たで。あんたええことしたん。',
    '惚れてまうやん。',
    'なんていい人なんだ！',
    '癒されちゃう♪',
    '明日、きっといいことあるで！',
    'もう！抱きしめてやるぅ。。',
    '君をなでなでしちゃうぞ！',
    'きっと喜ばれるよ〜(*´∀｀*)ﾉ',
    'その心がけに拍手！！',
  ],
  TOOL_BAR: {
    KEY: 'toolbar',
  },
  SCREEN_CHARIN_HISTORY: {
    KEY: 'charinHistory',
    TITLE: 'ちゃりん履歴',
  },
  SCREEN_HOME: {
    KEY: 'home',
    TITLE: 'Home',
  },
  SCREEN_CHARING: {
    KEY: 'charing',
    TITLE: 'ちゃリんする',
  },
  SCREEN_CHOOSE_HABIT_CHARING: {
    KEY: 'choose_habit_charing',
    TITLE: 'ちゃリんする',
  },
  SCREEN_CREATE_HABIT_ONLY_TODAY: {
    KEY: 'create_habit_only_today',
    TITLE: 'ちゃリんする',
  },

  SCREEN_CALENDAR: {
    KEY: 'calendar',
    TITLE: 'ちゃりん履歴',
  },
  SCREEN_OTHER: {
    KEY: 'other',
    TITLE: 'その他',
  },

  SCREEN_REGISTER_INFO: {
    KEY: 'register_info',
    TITLE: 'ユーザー設定',
  },

  SCREEN_SHARE_INFOR: {
    KEY: 'share',
    TITLE: 'シェアする',
  },
  SCREEN_START: {
    KEY: 'start',
    TITLE: '開始',
  },
  SCREEN_INTRODUCE: {
    KEY: 'introduce',
    TITLE: '紹介する',
  },
  SCREEN_WEBVIEW: {
    KEY: 'webview',
    TITLE: 'HapiBoo!プロジェクト',
  },
  SCREEN_NOTIFICATION_INFO: {
    KEY: 'notification',
    TITLE: 'お知らせ',
  },
  SCREEN_TERMS_OF_SERVICE: {
    KEY: 'termOfService',
    TITLE: '利用規約',
  },
  SCREEN_PRIVACY_POLICY: {
    KEY: 'privacyPolicy',
    TITLE: 'プライバシーポリシー',
  },
  SCREEN_COMPANY_PROFILE: {
    KEY: 'companyProfile',
    TITLE: '会社概要',
  },
  SCREEN_VERSION: {
    KEY: 'version',
    TITLE: 'バージョン',
  },
  SCREEN_SOUND: {
    KEY: 'sound',
    TITLE: 'サウンド',
  },
  SCREEN_CONFIRM: {
    KEY: 'confirm',
    TITLE: 'confirm',
  },
  SCREEN_LIST_HABIT: {
    KEY: 'listHabit',
    TITLE: '登録した習慣',
  },
  SCREEN_LIST_ALL_HABIT: {
    KEY: 'allHabit',
    TITLE: '',
  },
  SCREEN_LIST_HABIT_HEALTH: {
    KEY: 'healthHabit',
    TITLE: '',
  },
  SCREEN_LIST_HABIT_LEARNING: {
    KEY: 'learningHabit',
    TITLE: '',
  },
  SCREEN_LIST_HABIT_CONTRIBUTION: {
    KEY: 'contributonHabit',
    TITLE: '',
  },
  SCREEN_CREATE_HABIT: {
    KEY: 'createHabit',
    TITLE: '習慣登録',
  },
  SCREEN_EDIT_USER: {
    KEY: 'editUser',
    TITLE: 'editUser',
  },
  SCREEN_PREVIEW_HABIT: {
    KEY: 'previewHabit',
    TITLE: '登録した習慣',
  },
  SCREEN_PRIVACY: {
    KEY: 'Privacy',
    TITLE: 'HapiBoo!で、できること',
  },
  SCREEN_PDF_VIEW: {
    KEY: 'PdfView',
    TITLE: 'プライバシーポリシー',
  },
  WEB_VIEW_PROJECT: 'http://cdicom.xsrv.jp/hapiboo/project/',
  WEB_VIEW_SHARE: 'http://cdicom.xsrv.jp/hapiboo/share/',
  WEB_VIEW_INFORMATION: 'http://cdicom.xsrv.jp/hapiboo/information/',
  WEB_VIEW_TERMS: 'http://cdicom.xsrv.jp/hapiboo/terms/',
  WEB_VIEW_PRIVACY_POLICY: 'http://cdicom.xsrv.jp/hapiboo/privacy-policy/',
  WEB_VIEW_COMPANY: 'http://cdicom.xsrv.jp/hapiboo/company/',
  WEB_VIEW_VERSION: 'http://cdicom.xsrv.jp/hapiboo/version/',
  hoursArray: [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
  ],
  minutesArray: [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
  ],
};
