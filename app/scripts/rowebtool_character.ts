import { load } from 'cheerio'

let character_data: { [name: string]: any } = {
    "version": 1,
    "status": {
        "base_lv": 1,
        "job_lv": 1,
        "hp_max": 1,
        "sp_max": 1,
        "job_class_localization": ""
    },
    "skills": {
        "localization": {}
    },
    "additional_info": {
        "character_name": ""
    }
}

const main = async () => {
    const html = load(document.body.innerHTML)

    // キャラクター名
    character_data["additional_info"]["character_name"] = html("section > div.base > table > tbody > tr:nth-child(1) > td:nth-child(2)").text().trim()
    // ワールド名
    character_data["additional_info"]["world_name"] = html("section > div.base > table > tbody > tr:nth-child(2) > td:nth-child(2)").text().trim()
    // 職業
    character_data["status"]["job_class_localization"] = html("section > div.base > table > tbody > tr:nth-child(2) > td:nth-child(4)").text().trim()

    if (html("section > div.status > table > caption").text() == "ステータス") {
        // BaseLv
        character_data["status"]["base_lv"] = Number(html("section > div.status > table > tbody > tr:nth-child(1) > td:nth-child(2)").text())
        // JobLv
        character_data["status"]["job_lv"] = Number(html("section > div.status > table > tbody > tr:nth-child(2) > td:nth-child(2)").text())
        // MaxHP(hp_max)
        character_data["status"]["hp_max"] = Number(html("section > div.status > table > tbody > tr:nth-child(3) > td:nth-child(2)").text())
        // MaxSP(sp_max)
        character_data["status"]["sp_max"] = Number(html("section > div.status > table > tbody > tr:nth-child(4) > td:nth-child(2)").text())

        const regex_status_point = /^\s*([0-9]+)\s*/
        for (let idx = 1; idx <= 12; idx++) {
            let key: string = html("section > div.status > table > tbody > tr:nth-child(" + String(idx) + ") > th:nth-child(3)").text().toLocaleLowerCase()
            let value: string = html("section > div.status > table > tbody > tr:nth-child(" + String(idx) + ") > td:nth-child(4)").text()
            let matches = value.match(regex_status_point)

            if (matches != null) {
                let point: number = Number(matches[1])
                console.debug("idx: %d, key: %s, point: %d", idx, key, point)
                character_data["status"][key] = point
            }
        }
    }

    if (html("section > div.skill > table > caption > p").text() == "スキル") {
        let cols = html("body > main > article > section > div.skill > table > tbody > tr").children("td")

        const regex_skill_lv = /^Lv ([0-9]+)/
        let skill_name: string = ""
        cols.each(function (idx, element) {
            let text = html(element).text().trim()
            if ((idx % 2) == 0 && text != "") {
                // スキル名
                skill_name = text
                character_data["skills"]["localization"][skill_name] = 0
            } else if (skill_name != "") {
                // スキルLv
                let matches = text.match(regex_skill_lv)
                if (matches != null) {
                    let lv: number = Number(matches[1])
                    character_data["skills"]["localization"][skill_name] = lv
                    console.debug("skill_name: %s, lv: %d", skill_name, lv)
                }
                skill_name = "" //clear
            }
        })
    }

    console.log(character_data)

    // JSON
    let string_json = JSON.stringify(character_data)

    const element_section = document.createElement("section")
    element_section.innerHTML = `
<hr/>
<style>
<!--
.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
.btn:hover {
  color: #212529;
}
.btn-check:focus + .btn, .btn:focus {
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
.btn:disabled, .btn.disabled, fieldset:disabled .btn {
  pointer-events: none;
  opacity: 0.65;
}

.btn-primary {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}
.btn-primary:hover {
  color: #fff;
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

-->
</style>
<div id="rodb_character_information_export">
<h1>RODB:ラグナロクオンライン キャラクター情報エクスポート</h1>
<input id="button_json_translator" class="btn btn-primary btn-lg" type="click" value="JSON Translatorへ転送" />
<input id="button_redirect_rodb_simulator" class="btn btn-primary btn-lg" type="click" value="RODB Simulatorへ転送" />

<br/>
<p>JSONデータ</p>
<textarea id="json_data" rows="10" style="width: 100%;" readonly>` + string_json + `</textarea>
</div>
`
    document.getElementsByTagName("article").item(0)?.appendChild(element_section)

    const button_json_translator = document.getElementById('button_json_translator')
    button_json_translator?.addEventListener('click', event => {
        event.preventDefault();

        fetch('https://rodb.aws.0nyx.net/json-translator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: string_json
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    console.log("success")
                }
            })
            .catch(error => console.log(error))
    })

    const button_redirect_rodb_simulator = document.getElementById('button_redirect_rodb_simulator')
    button_redirect_rodb_simulator?.addEventListener('click', event => {
        event.preventDefault();

        fetch('https://rodb.aws.0nyx.net/json-translator/redirect/rodb-simulator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: string_json
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    location.href = result.url
                }
            })
            .catch(error => console.log(error))
    })
}

main()
