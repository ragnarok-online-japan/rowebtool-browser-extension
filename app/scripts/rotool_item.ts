const main = async () => {
    const regex_item_id = /^\/item\/(\d+)\/?/
    const matches = location.pathname.match(regex_item_id)

    if (matches == undefined || matches?.length == 0)
        return

    const item_id = Number(matches[1])

    fetch('https://rodb.aws.0nyx.net/bokehro-check/' + item_id, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((response) => response.json())
        .then((result) => {
            if (result.success == true) {
                element_injection(item_id, result.data, result.export_img_url)
            }
        })
        .catch(error => console.log(error))
}

const element_injection = (item_id: number, data: any, export_img_url: string) => {
    const item_name: string = data.item_name
    const item_name_encodeed: string = encodeURI(item_name)
    const element_section = document.createElement("section")
    element_section.setAttribute("class", "content-wrap transction-wrap")

    let inner_html = `
<div>
<style>
div.center {
    text-align: center;
}
img.bokehro {
    min-width: 64px;
    min-height: 488px;
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
`
    if (data.highend) {
        const heighend_item_id: number = data.highend.item_id
        const heighend_item_name: string = data.highend.item_name
        inner_html += `<p class="alert_msg" > このアイテムには上位<br><a href="https://rotool.gungho.jp/item/` + heighend_item_id + `/0/">` + heighend_item_name + `</a><br>が存在します </p>`
    }

    inner_html += `
<div class="center">
<a href="https://rodb.aws.0nyx.net/bokehro/`+ item_id + `#plot" target="_blank">
<img src="`+ export_img_url + `" alt="RODB: Bokeh RO png image" class="bokehro" /><br/>
RODB - Bokeh RO : `+ item_name + ` を開く</a><br/>
</div>

<hr class="line">

<div class="center">
<a href="https://roitemsearch.web.app/?search=`+ item_name_encodeed + `" target="_blank">
ROアイテム検索くん で開く</a><br/>
</div>

<hr class="line">

<div class="center">
<a href="http://unitrix.net/?c=`+ item_id + `" target="_blank">
Unitrix ラグナロク露店相場リサーチ で開く</a><br/>
</div>

<hr class="line">

<h4>Created by <a href="https://rodb.aws.0nyx.net/">RODB - 0nyx.net</a></h4>
</div>`

    element_section.innerHTML = inner_html
    //末尾にsection追加
    document.getElementsByTagName("article").item(0)?.appendChild(element_section)

    //既存のsectionのclass書き換え
    document.getElementsByTagName("section").item(4)?.setAttribute("class", "content-wrap")
}

main()
