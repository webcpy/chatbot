export const dataArray = [
  { value: 46, label: '宠物新闻' },
  { value: 45, label: '电竞资讯' },
  { value: 43, label: '女性新闻' },
  { value: 42, label: '垃圾分类新闻' },
  { value: 41, label: '环保资讯' },
  { value: 40, label: '影视资讯' },
  { value: 38, label: '汉服新闻' },
  { value: 36, label: '科学探索' },
  { value: 35, label: '汽车新闻' },
  { value: 34, label: '互联网资讯' },
  { value: 33, label: '动漫资讯' },
  { value: 32, label: '财经新闻' },
  { value: 31, label: '游戏资讯' },
  { value: 30, label: 'CBA新闻' },
  { value: 29, label: '人工智能' },
  { value: 27, label: '军事新闻' },
  { value: 26, label: '足球新闻' },
  { value: 24, label: '创业新闻' },
  { value: 22, label: 'IT资讯' },
  { value: 21, label: 'VR科技' },
  { value: 20, label: 'NBA新闻' },
  { value: 19, label: '苹果新闻' },
  { value: 18, label: '旅游资讯' },
  { value: 17, label: '健康知识' },
  { value: 13, label: '科技新闻' },
  { value: 12, label: '体育新闻' },
  { value: 10, label: '娱乐新闻' },
  { value: 8, label: '国际新闻' },
  { value: 7, label: '国内新闻' },
  { value: 5, label: '社会新闻' }
]

export function keyMap(array: any[]) {
  return array.reduce((result, item) => {
    result[item.value] = item.label
    return result
  }, {})
}

export const newStatus = keyMap(dataArray)
