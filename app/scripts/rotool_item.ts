import { load } from 'cheerio'

const main = async () => {
    const html = load(document.body.innerHTML)
    const item_name = html("body > main > article > h1").text().trim()

    fetch('https://rodb.aws.0nyx.net/bokehro-check?name=' + encodeURI(item_name), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.success == true) {
                element_injection(result.request.item_name, result.item_id || -1, result.export_img_url)
            }
        })
        .catch(error => console.log(error))
}

const element_injection = (item_name: string, item_id: number, export_img_url: string) => {
    const item_name_eocodeed: string = encodeURI(item_name)
    const element_section = document.createElement("section")
    element_section.setAttribute("class", "content-wrap transction-wrap")
    element_section.innerHTML = `
<div>
<style>
div.center {
    text-align: center;
}
img.loading {
   background-image: url("https://rodb.aws.0nyx.net/assets/img/loading_fidget-spinner.gif");
   background-repeat: no-repeat;
   background-position: center center;
}
hr.line {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    border: 1px solid rgba(0 170 236 / 0.3);
    display: block;
}
</style>
<h3 class="section-ttl_mini">Extension Links</h3>

<div class="center">
<a href="https://rodb.aws.0nyx.net/bokehro?name=`+ item_name_eocodeed + `#plot" target="_blank">
<img src="`+ export_img_url + `" alt="RODB: Bokeh RO png image" class="loading" /><br/>
RODB - Bokeh RO : `+ item_name + ` を開く</a><br/>
</div>

<hr class="line">

<div class="center">
<a href="https://roitemsearch.web.app/?search=`+ item_name_eocodeed + `" target="_blank">
ROアイテム検索くん で開く</a><br/>
</div>

<hr class="line">

<h4>Created by <a href="https://rodb.aws.0nyx.net">RODB - 0nyx.net</a></h4>
            </div>`

    //末尾にsection追加
    document.getElementsByTagName("article").item(0)?.appendChild(element_section)

    //既存のsectionのclass書き換え
    document.getElementsByTagName("section").item(4)?.setAttribute("class", "content-wrap")
}

main()
