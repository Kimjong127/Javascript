import { launch, goto, checkPopup, evalSido, evalSigungu, closeAlert, getPageLength, getData, writeFile, getAddr } from './module/crawler.js'    // crawler 파일에서 각각의 함수들을 불러옴

async function main() {
    getAddr()
    // await launch('seoul', 'kangnam_gu')
    // await goto('https://www.pharm114.or.kr/main.asp')
    // await checkPopup()
    // await evalSido()
    // await evalSigungu()
    // await closeAlert()
    // await getPageLength()
    // await getData()
    // writeFile()
    // process.exit(1)
}

main()