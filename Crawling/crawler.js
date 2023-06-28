import puppeteer from "puppeteer"
import fs from 'fs'
import axios from 'axios'

const launchConfig = {
    headless: false,
    defaultViewport: null,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--no-sandbox', '--disable-setuid-sandbox',
    '--disable-notifications', '--disable-extensions'],
}

let browser                                                              // 전역변수로 설정하여 변수 고정
let page
let sido, sigungu
const lengthSelector = 'body > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(5) > td > table:nth-child(5) > tbody > tr:nth-child(4) > td > table > tbody > tr > td:nth-child(3)'
let pageLength
let finalData = []

const launch = async (sidoCode, sigunguCode) => {                       // 페이지 설정 및 시도, 시군구 코드 받기
    browser = await puppeteer.launch(launchConfig);
    const pages = await browser.pages()
    page = pages[0]
    sido = sidoCode
    sigungu = sigunguCode
}

const goto = async (url) => {                                            // 페이지로 이동
    await page.goto(url)
}

const checkPopup = async () => {                                           // 팝업 창 닫기
    const pages = await browser.pages()
    await pages[1].close()
}

const evalSido = async () => {                                           // querySelector 사용하여 서울시(시도) 클릭
    await page.evaluate((sido) => {
        document.querySelector(`#continents > li.${sido} > a`).click()
      }, sido)
}

const evalSigungu = async () => {
    const pageSelector = `#continents > li.${sigungu} > a`                                        // 강남구(시구) 클릭 - 작은 따옴표 X (``)
    await page.waitForSelector(pageSelector)                                           // 클릭할 시간을 주기 위해 waitForSelector 사용(셀렉터가 있을 때까지 기다리는 경우)
    await page.evaluate((pageSelector) => {
        document.querySelector(pageSelector).click()
    }, pageSelector)
}

const closeAlert = async () => {                                       // 알림창 닫기 (page.on -> event 타입(현재 코드에선 'dialog')을 감지하여 핸들링)
    await page.on('dialog', async(dialog) => {
        await dialog.accept()
    })
}      

const getPageLength = async () => {                                               // 첫 페이지에서 페이지의 갯수 얻기
    await page.waitForSelector(lengthSelector)                                                           
    pageLength = await page.evaluate((lengthSelector) => {
        return document.querySelector(lengthSelector).children.length
    }, lengthSelector)
}

const getData = async () => {                                   // 변수에 담긴 데이터 가져오기
    for(let i=0; i<pageLength; i++) {
        await page.waitForSelector(lengthSelector)
        const jsonData = await page.evaluate((sido, sigungu) => {
            var targetEl = document.querySelectorAll(
                "#printZone > table:nth-child(2) > tbody > tr"
                )
            var data = Array.from(targetEl).map(el => {
                const tdArr = el.querySelectorAll('td') 
                const name = tdArr[1]?.innerText
                const addr = tdArr[2]?.innerText?.replaceAll('\n', '')?.replaceAll('\t', '')
                const tel = tdArr[3]?.innerText  
                const open = tdArr[4]?.innerText?.replaceAll('\n', '')?.replaceAll('\t', '') 
                return {
                    name,
                    addr,
                    tel,
                    open,
                    sido,
                    sigungu
                }
            })
            .filter(data => data.name != undefined)
            return data

        }, sido, sigungu) //end eval

        finalData = finalData.concat(jsonData)                // final data
        // Array.from(a).at(-1).querySelector('a')
        
        if(i != pageLength) {
            // paging click
            console.log('current Page', i)
            await page.evaluate((lengthSelector, i) => {
                document.querySelector(lengthSelector).children[i].click()
            }, lengthSelector, i)
            await page.waitForSelector('#printZone')
        } // end if

        console.log(jsonData)
    
    } // end loop

    browser.close()                        // broswer 닫기

} // end getData

const getAddr = async () => {                                                    // API call (addr의 메타 데이터에서 좌표 뽑아내기)
    const url = 'https://dapi.kakao.com/v2/local/search/address.json'
    const result = await axios.get(url, {
        params: {
            query: '(06025) 서울 강남구 논현로 842 1층'
        },
        headers: {
            Authorization: 'KakaoAK 55b9a894b4a9960ce8da2e67ccc6aa55'
        }
    })
    const { x, y } = result.data.documents[0].address
    console.log(x, y)
}

const writeFile = () => {                                      // 결과 파일 생성
    const writePath = `./json/${sido}`
    const exist = fs.existsSync(writePath)                              // 경로 유무확인
    
    if(!exist) {
        fs.mkdir(writePath, { recursive: true }, err => {

        })
    }
    const filePath = `${writePath}/${sigungu}.json`
    const stringData = JSON.stringify(finalData)
    fs.writeFileSync(filePath, stringData)
}

export {                                  // export (각각의 함수를 설정하여 분화시킴 -> 유지보수가 쉬워지고 후에 오류가 났을 때 해결이 쉬어짐)
    launch,
    goto,
    checkPopup,
    evalSido,
    evalSigungu,
    closeAlert,
    getPageLength,
    getData,
    writeFile,
    getAddr,
}