
console.log("BBYC©2021-2023版权所有\n███████████████▒▒ ███████████████▒▒ ██▒▒         ██▒▒ ██████████████▒▒\n██▒▒          ██▒▒██▒▒          ██▒▒  ██▒▒     ██▒▒ ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒    ██▒▒ ██▒▒   ██▒▒              \n███████████████▒▒ ███████████████▒▒       ███▒▒     ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒      ███▒▒     ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒      ███▒▒     ██▒▒              \n███████████████▒▒ ███████████████▒▒       ███▒▒       ██████████████▒▒\n");

const websites = [//搜索引擎、视频网站、开发平台、设计网站、IT技术、博客平台、电商网站、导航地图
    { category: '搜索引擎', name: 'Bing', url: 'https:// http://www.bing.com', icon: 'fas fa-search', description: '全球领先的搜索引擎' },
    { category: '搜索引擎', name: '百度', url: 'https:// http://www.baidu.com', icon: 'fas fa-search', description: '全球最大的中文搜索引擎' },
    { category: '视频网站', name: '哔哩哔哩', url: 'https:// http://www.bilibili.com', icon: 'fas fa-video', description: '年轻人的弹幕视频网站' },
    { category: '设计网站', name: '即时设计', url: 'https://js.design', icon: 'fas fa-palette', description: '设计师的创意灵感分享平台' },
    { category: '开发平台', name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github', description: '全球最大的开源代码托管平台' },
    { category: '电商网站', name: '淘宝', url: 'https://ai.taobao.com', icon: 'fas fa-shopping-cart', description: '智能化的购物体验' },
    { category: 'IT技术', name: 'CSDN', url: 'https:// http://www.csdn.net', icon: 'fas fa-laptop-code', description: '程序员的学习与交流平台' },
    { category: 'IT技术', name: '小众软件', url: 'https:// http://www.appinn.com', icon: 'fas fa-cogs', description: '分享优秀小众软件的网站' },
    { category: 'IT技术', name: '极客翻译', url: 'https:// http://www.ghxi.com', icon: 'fas fa-language', description: 'IT技术文档翻译社区' },
    { category: '设计网站', name: '500px', url: 'https://500px.com', icon: 'fas fa-camera', description: '摄影师的作品展示平台' },
    { category: '设计网站', name: 'Pinterest', url: 'https:// http://www.pinterest.com', icon: 'fab fa-pinterest', description: '灵感和创意的分享平台' },
    { category: '设计网站', name: '优设网', url: 'https:// http://www.uisdc.com', icon: 'fas fa-paint-brush', description: '设计师的学习与交流平台' },
    { category: '设计网站', name: '花瓣网', url: 'https://huaban.com', icon: 'fas fa-paint-brush', description: '设计师的灵感收集平台' },
    { category: '设计网站', name: 'Foco设计', url: 'https:// http://www.focodesign.com', icon: 'fas fa-paint-brush', description: '设计师的灵感与资源分享' },
    { category: 'IT技术', name: '菜鸟教程', url: ' http://www.runoob.com', icon: 'fas fa-book', description: '提供编程技术基础教程' },
    { category: '设计网站', name: '17中国素材网', url: ' http://www.17sucai.com', icon: 'fas fa-palette', description: '提供各种网站模板和素材' },
    { category: '设计网站', name: '懒人建站', url: ' http://www.51xuediannao.com', icon: 'fas fa-laptop', description: '提供免费的web前端资源和教程' },
    { category: '设计网站', name: '阿里巴巴矢量图标库', url: ' http://www.iconfont.cn', icon: 'fas fa-icons', description: '提供丰富的矢量图标下载和在线存储' },
    { category: '导航地图', name: '百度地图开放平台', url: 'http://lbsyun.baidu.com', icon: 'fas fa-map', description: '提供丰富的地图应用开发API' },
    { category: '开发平台', name: 'jQuery Mobile', url: ' http://www.lampweb.org/jquerymobile/1', icon: 'fas fa-mobile-alt', description: '创建移动Web应用程序的框架' },
    { category: 'IT技术', name: '知识库', url: 'http://lib.csdn.net', icon: 'fas fa-book-open', description: '技术百科全书' },
    { category: 'IT技术', name: '前端学习资源汇总', url: 'http://123.w3cschool.cn/plk2fi', icon: 'fas fa-code', description: '前端学习资源和工具汇总' },
    { category: 'IT技术', name: '微信小程序咨询网', url: 'http://xiaochengxu.info/page/2', icon: 'fab fa-weixin', description: '微信小程序资讯和下载' },
    { category: 'IT技术', name: '微信公众平台.小程序文档', url: 'https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1474632113_xQVCl&token=&lang=zh_CN', icon: 'fab fa-weixin', description: '微信小程序开发文档和设计指南' },
    { category: '设计网站', name: '设计导航', url: ' http://www.qingnian8.com', icon: 'fas fa-compass', description: '常用网站推荐和设计资源' },
    { category: '开发平台', name: '后台框架主页', url: ' http://www.17sucai.com/preview/41162/2015-12-18/hplus1/hplus1/index.html', icon: 'fas fa-desktop', description: '基于Bootstrap的后台框架主页' },
    { category: '设计网站', name: '标志在线', url: ' http://www.logomaker.com.cn', icon: 'fas fa-pen-nib', description: '在线LOGO制作工具' },
    { category: 'IT技术', name: '前端面试题总结', url: 'https://github.com/markyun/My-blog/tree/master/Front-end-Developer-Questions/Questions-and-Answers', icon: 'fas fa-question-circle', description: '前端面试题集合' },
    { category: '设计网站', name: 'PS技巧', url: 'http://edu.51cto.com/lession/id-82199.html', icon: 'fas fa-magic', description: 'Adobe Photoshop技巧教程' },
    { category: '开发平台', name: 'FineUI', url: ' http://www.fineui.com', icon: 'fas fa-th-large', description: '基于jQuery/ExtJS的ASP.NET控件库' },
    { category: '开发平台', name: 'jQuery插件库', url: ' http://www.jq22.com', icon: 'fas fa-puzzle-piece', description: '常用jQuery插件库' },
    { category: '设计网站', name: 'dowebok', url: ' http://www.dowebok.com', icon: 'fas fa-globe', description: '提供代码、素材、特效、教程、模板等建站服务' },
    { category: '社交网络', name: 'Ghost开源博客平台', url: ' http://www.ghostchina.com', icon: 'fas fa-ghost', description: '基于Node.js的开源博客平台' },
    { category: '开发平台', name: '为WEB艺术家创造的PHP框架', url: ' http://www.golaravel.com', icon: 'fab fa-php', description: 'Laravel PHP框架中文文档' },
    { category: '开发平台', name: '突围阿', url: 'http://tuweia.cn/c/home', icon: 'fas fa-laptop-code', description: '无编程建站工具和响应式网站制作' },
    { category: '社交网络', name: '博客园', url: ' http://www.cnblogs.com', icon: 'fas fa-blog', description: '个人笔记和学习交流的博客平台' },
    { category: 'IT技术', name: '阮一峰React入门实例', url: ' http://www.ruanyifeng.com/blog/2015/03/react.html', icon: 'fab fa-react', description: 'React.js中文文档和教程' },
    

{ category: '搜索引擎', name: '谷歌', url: ' http://www.google.com', icon: 'fas fa-search', description: '全球最大的搜索引擎' },
{ category: '搜索引擎', name: '雅虎搜索', url: 'https://search.yahoo.com/', icon: 'fas fa-search', description: '雅虎旗下的搜索引擎' },
{ category: '搜索引擎', name: 'Yandex', url: 'https://yandex.com', icon: 'fas fa-search', description: '俄罗斯最大的搜索引擎' },
{ category: '搜索引擎', name: 'goo', url: 'https:// http://www.goo.ne.jp/', icon: 'fas fa-search', description: '日本的搜索引擎' },
{ category: '搜索引擎', name: 'AOL搜索', url: ' http://www.search.aol.com', icon: 'fas fa-search', description: 'AOL旗下的搜索引擎' },
{ category: '搜索引擎', name: 'WebCrawler', url: ' http://www.webcrawler.com/', icon: 'fas fa-search', description: '元搜索引擎' },
{ category: '搜索引擎', name: 'MyWebSearch', url: ' http://www.mywebsearch.com/', icon: 'fas fa-search', description: '个性化搜索引擎' },
{ category: '搜索引擎', name: 'WOW', url: ' http://www.wow.com/', icon: 'fas fa-search', description: '多媒体搜索引擎' },
{ category: '搜索引擎', name: 'InfoSpace', url: ' http://www.infospace.com/', icon: 'fas fa-search', description: '元搜索引擎' },
{ category: '搜索引擎', name: 'Blekko', url: ' http://www.blekko.com/', icon: 'fas fa-search', description: '反垃圾邮件搜索引擎' },
{ category: '搜索引擎', name: 'Fireball', url: ' http://www.fireball.de', icon: 'fas fa-search', description: '德国的搜索引擎' },
{ category: '搜索引擎', name: 'Lycos', url: ' http://www.lycos.com', icon: 'fas fa-search', description: '全球搜索引擎' },
{ category: '搜索引擎', name: 'Search.com', url: ' http://www.search.com', icon: 'fas fa-search', description: '多功能搜索引擎' },
{ category: '搜索引擎', name: 'Hispavista', url: ' http://www.hispavista.com', icon: 'fas fa-search', description: '西班牙语搜索引擎' },
 { category: 'B2B贸易平台', name: 'Alibaba', url: ' http://www.alibaba.com', icon: 'fas fa-search', description: '全球最大的在线B2B交易平台' },
 { category: 'B2B贸易平台', name: 'Made-in-China', url: ' http://www.made-in-china.com', icon: 'fas fa-search', description: '中国制造业B2B交易平台' },
{ category: 'B2B贸易平台', name: 'GlobalSpec', url: ' http://www.globalspec.com/', icon: 'fas fa-search', description: '工业产品和工程技术的B2B平台' },
 { category: 'B2B贸易平台', name: 'Kompass', url: ' http://www.kompass.com', icon: 'fas fa-search', description: '全球B2B企业目录' },
 { category: 'B2B贸易平台', name: 'TradeKey', url: ' http://www.tradekey.com', icon: 'fas fa-search', description: '全球B2B贸易平台' },
 { category: 'B2B贸易平台', name: 'Tootoo', url: ' http://www.tootoo.com', icon: 'fas fa-search', description: '全球B2B交易平台' },
 { category: 'B2B贸易平台', name: 'ECVV', url: ' http://www.ecvv.com', icon: 'fas fa-search', description: '中国领先的B2B平台' },
 { category: 'B2B贸易平台', name: 'EC21', url: ' http://www.ec21.com', icon: 'fas fa-search', description: '全球B2B市场' },
 { category: 'B2B贸易平台', name: 'Fuzing', url: ' http://www.fuzing.com', icon: 'fas fa-search', description: '全球B2B市场' },
 { category: 'B2B贸易平台', name: 'B2S', url: ' http://www.b2s.com/', icon: 'fas fa-search', description: '全球B2B电子商务平台' },
 { category: 'B2B贸易平台', name: 'Commerce', url: ' http://www.commerce.com.tw', icon: 'fas fa-search', description: '台湾B2B电子商务平台' },
 { category: 'B2B贸易平台', name: 'Industry Directory', url: ' http://www.industrydirectory.com', icon: 'fas fa-search', description: '全球B2B工业目录' },
 { category: 'B2B贸易平台', name: 'DIYTrade', url: ' http://www.diytrade.com', icon: 'fas fa-search', description: '全球B2B贸易平台' },
 { category: 'B2B贸易平台', name: 'ECPlaza', url: ' http://www.ecplaza.net', icon: 'fas fa-search', description: '全球B2B市场' },


  { category: '社交网络', name: 'LinkedIn', url: 'https:// http://www.linkedin.com/', icon: 'fas fa-search', description: '全球领先的职业社交平台' },
  { category: '社交网络', name: 'Facebook', url: 'https:// http://www.Facebook.com/', icon: 'fas fa-search', description: '全球最大的社交网络平台' },
  { category: '社交网络', name: 'Instagram', url: 'https:// http://www.instagram.com/', icon: 'fas fa-search', description: '提供在线照片共享，视频共享和社交网络服务' },
  { category: '社交网络', name: 'Twitter', url: 'https://twitter.com/', icon: 'fas fa-search', description: '全球知名的社交媒体平台' },
  { category: '社交网络', name: 'Tumblr', url: 'https:// http://www.tumblr.com/', icon: 'fas fa-search', description: '微博客平台' },
  { category: '视频网站', name: 'YouTube', url: 'https:// http://www.youtube.com/', icon: 'fas fa-search', description: '全球最大的视频分享平台' },
  { category: '社交网络', name: 'Pinterest', url: 'https:// http://www.pinterest.com/', icon: 'fas fa-search', description: '图片存储和分享平台' },
  { category: '社交网络', name: 'VK', url: 'https:// http://www.vk.com', icon: 'fas fa-search', description: '俄罗斯最大的社交网络平台' },
  { category: '图片共享', name: 'Flickr', url: 'https:// http://www.flickr.com/', icon: 'fas fa-search', description: '以音乐为重心的社交网络服务网站' },
 


   { category: '其他', name: 'Wer Liefert Was', url: ' http://www.wlw.de', icon: 'fas fa-search', description: '德国的B2B企业名录' },
   { category: '其他', name: 'Europages', url: ' http://www.europages.com', icon: 'fas fa-search', description: '欧洲的黄页服务' },
   { category: '其他', name: 'Yellow Pages Canada', url: 'https:// http://www.yellowpages.ca/', icon: 'fas fa-search', description: '加拿大的黄页服务' },
   { category: '其他', name: 'Yellow.com', url: ' http://www.yellow.com/011.html', icon: 'fas fa-search', description: '西非的黄页服务' },
   { category: '其他', name: 'Yellow Pages South Africa', url: ' http://www.yellowpages.co.za/', icon: 'fas fa-search', description: '南非的黄页服务' },
   { category: '其他', name: 'Yellow Pages Qatar', url: 'http://yellowpages.qa/web/8679/middle-east-merchants', icon: 'fas fa-search', description: '中东的黄页服务' },
   { category: '其他', name: 'Jim Yellow Pages', url: ' http://www.jimyellowpages.com/', icon: 'fas fa-search', description: '印度的黄页服务' },
   { category: '其他', name: 'Seek Yellow Pages', url: ' http://www.seekyellowpages.com/south-america.html', icon: 'fas fa-search', description: '南美的黄页服务' },
   { category: '其他', name: 'Thomasnet', url: ' http://www.thomasnet.com', icon: 'fas fa-search', description: '美国的B2B企业名录' },
   { category: '其他', name: 'Yell', url: 'https:// http://www.yell.com/', icon: 'fas fa-search', description: '英国的黄页服务' },
   { category: '其他', name: 'FITA', url: 'http://fita.org/index.html', icon: 'fas fa-search', description: '国际贸易协会联盟' },
   { category: '其他', name: 'Czechtrade', url: 'http://catalog.czechtrade.us', icon: 'fas fa-search', description: '捷克的B2B企业名录' },
   { category: '其他', name: 'BDEC Online', url: ' http://www.bdec-online.com/index.htm', icon: 'fas fa-search', description: '商业目录' },
 { category: '其他', name: 'Herold.at', url: ' http://www.herold.at', icon: 'fas fa-search', description: '奥地利的网站' },
   { category: '其他', name: 'Scoot.co.uk', url: ' http://www.scoot.co.uk', icon: 'fas fa-search', description: '英国本土的网站' },
   { category: '其他', name: 'Applegate.co.uk', url: ' http://www.applegate.co.uk', icon: 'fas fa-search', description: '英国本土的网站' },
   { category: '其他', name: 'Commercial Place', url: ' http://www.commercialplace.com/', icon: 'fas fa-search', description: '商业目录' },
   { category: '其他', name: 'Turkey Industry', url: ' http://www.turkey-industry.com', icon: 'fas fa-search', description: '土耳其的B2B企业名录' },
   { category: '其他', name: 'PagineGialle', url: ' http://www.paginegialle.it/', icon: 'fas fa-search', description: '意大利的黄页服务' },
   { category: '其他', name: 'Cámara de Industria Paraguayo Alemana', url: ' http://www.cip.org.py/', icon: 'fas fa-search', description: '巴拉圭的进出口商名录' },
   { category: '其他', name: 'Chilnet', url: ' http://www.chilnet.cl', icon: 'fas fa-search', description: '智利的进口商名录' },
   { category: '其他', name: 'Vietnam Customs', url: ' http://www.customs.gov.vn', icon: 'fas fa-search', description: '越南的进出口名录' },
   { category: '其他', name: 'Ethiomarket', url: ' http://www.ethiomarket.com/Products/products_init.html', icon: 'fas fa-search', description: '埃塞俄比亚的进口商名录' },
   { category: '其他', name: 'BD Yellow Book', url: ' http://www.bdyellowbook.com', icon: 'fas fa-search', description: '孟加拉的企业名录' },
{ category: '其他', name: 'Business Baltics', url: ' http://www.business-baltics.com/latvia', icon: 'fas fa-search', description: '拉脱维亚的进口商' },
   { category: '其他', name: 'Business Baltics', url: ' http://www.business-baltics.com/lithuania', icon: 'fas fa-search', description: '立陶宛的进口商' },
   { category: '其他', name: 'Zauba', url: ' http://www.zauba.com/', icon: 'fas fa-search', description: '印度的海关进出口网站' },
   { category: '其他', name: 'TradeIndia', url: ' http://www.tradeindia.com/', icon: 'fas fa-search', description: '印度的进出口商名录' },
   { category: '其他', name: 'Indian Yellow Pages', url: ' http://www.indianyellowpages.com/', icon: 'fas fa-search', description: '印度的进出口商黄页' },
   { category: '其他', name: 'DueDil', url: 'https:// http://www.duedil.com/', icon: 'fas fa-search', description: '英国的企业查询网站' },
   { category: '其他', name: 'True Yellow', url: ' http://www.trueyellow.com/', icon: 'fas fa-search', description: '美国各州的企业名录' },
   { category: '其他', name: 'Importers in USA', url: ' http://www.importersinusa.com/', icon: 'fas fa-search', description: '美国的进口商名录' },
   { category: '其他', name: 'LookSmart', url: ' http://www.looksmart.com/', icon: 'fas fa-search', description: '全美最大的目录导航' },
  { category: '其他', name: 'Import Genius', url: ' http://www.importgenius.com/', icon: 'fas fa-search', description: '进出口业务国际贸易数据库' },
   { category: '其他', name: 'Exporters India', url: ' http://www.exportersindia.com/foreign-importers/index-a.html', icon: 'fas fa-search', description: '全球进口商查询数据' },
  

    { category: '政府采购', name: '中国政府采购网', url: ' http://www.ccgp.gov.cn/', icon: 'fas fa-search', description: '中国政府采购信息发布平台' },
    { category: '政府采购', name: 'DG Market', url: ' http://www.dgmarket.com/', icon: 'fas fa-search', description: '发展机构和政府发布的采购招标资讯' },
    { category: '网购平台', name: '中国商品网', url: 'http://ccn.mofcom.gov.cn/', icon: 'fas fa-search', description: '中国商品网站' },
   

    { category: '家具协会', name: '丹麦家具工业协会', url: ' http://www.danishfurniture.dk', icon: 'fas fa-search', description: '丹麦家具工业协会' },
    { category: '家具协会', name: '加州家具生产商协会', url: ' http://www.cfma.com', icon: 'fas fa-search', description: '加州家具生产商协会' },
    { category: '家具协会', name: '新加坡家具工业理事会', url: ' http://www.singaporefurniture.com', icon: 'fas fa-search', description: '新加坡家具工业理事会' },
    { category: '家具协会', name: '日本国际家具产业振兴会', url: ' http://www.idafij.com', icon: 'fas fa-search', description: '日本国际家具产业振兴会' },
    { category: '家具协会', name: '英国家具生产商协会', url: ' http://www.bfm.org.uk', icon: 'fas fa-search', description: '英国家具生产商协会' },
    { category: '家具协会', name: '美国家具联盟', url: ' http://www.ahfa.us', icon: 'fas fa-search', description: '美国家具联盟' },
    { category: '家具协会', name: '新西兰家具协会', url: ' http://www.fanzweb.com', icon: 'fas fa-search', description: '新西兰家具协会' },
    { category: '家具协会', name: '新加坡家具商会', url: ' http://www.sfa.org.sg', icon: 'fas fa-search', description: '新加坡家具商会' },
    { category: '家具协会', name: '安大略家具生产者协会', url: ' http://www.ofma.ca', icon: 'fas fa-search', description: '安大略家具生产者协会' },
    { category: '家具协会', name: '泰国家具工业协会', url: ' http://www.tfa.or.th', icon: 'fas fa-search', description: '泰国家具工业协会' },
    { category: '家具协会', name: '澳大利亚家具工业协会', url: ' http://www.fiaa.com.au', icon: 'fas fa-search', description: '澳大利亚家具工业协会' },
    { category: '家具协会', name: '马来西亚家具同业联合总会', url: ' http://www.mfea.org.my', icon: 'fas fa-search', description: '马来西亚家具同业联合总会' },
    { category: '家具协会', name: '加拿大家具生产者协会', url: ' http://www.furniturewest.ca', icon: 'fas fa-search', description: '加拿大家具生产者协会' }


];

$(document).ready(function() {
    displayWebsites();
    $('#newSpellButton').click(function() {
        alert('“法术”已生效');
        document.body.contentEditable='true'; document.designMode='on'; void 0
    });
});

function displayWebsites() {
    const websiteList = $('#websiteList');
    
    // Clear existing buttons
    websiteList.empty();

    // Create buttons for each category
    const categories = [...new Set(websites.map(website => website.category))];
    categories.forEach((category, index) => {
        const categoryWebsites = websites.filter(website => website.category === category);

        const categorySection = $('<div>').addClass('categorySection').addClass('category' + (index + 1));
        categorySection.attr('id', category.toLowerCase().replace(" ", "-"));

        const categoryTitle = $('<h2>').addClass('categoryTitle').text(category);
        categorySection.append(categoryTitle);

        const websiteButtons = $('<div>').addClass('websiteButtons');

        categoryWebsites.forEach(website => {
            const button = $('<a>').addClass('button');
            button.attr('href', website.url);
            button.attr('target', '_blank');

            const icon = $('<i>').addClass(website.icon);
            button.append(icon);

            const buttonText = $('<p>').text(website.name);
            button.append(buttonText);

            const description = $('<p>').text(website.description);
            button.append(description);

            websiteButtons.append(button);
        });

        categorySection.append(websiteButtons);
        websiteList.append(categorySection);
    });
}