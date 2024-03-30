import superagent from 'superagent'
import cheerio from 'cheerio'

export async function doutuApi(keyword: any) {
  try {
    const response = await superagent.get('https://www.pkdoutu.com/search').query({ type: 'photo', more: 1, keyword, page: 1 }); // 添加查询参数
    // 返回响应体
    return getImgList(response.text, '.pic-content')
  } catch (error) {
    // 处理错误
    log.fail('发生错误:', error);
    throw error;
  }
}

function getImgList(htmlContent: string, selector: string) {
  const $ = cheerio.load(htmlContent);
  const imagePaths: string[] = [];
  $(selector).find('img').each(function() {
    const imagePath = $(this).attr('data-original');
    if (imagePath) {
      imagePaths.push(imagePath);
    }
  });
  return imagePaths;
}