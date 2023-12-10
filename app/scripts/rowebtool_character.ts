import { load } from 'cheerio'

let character_data: { [name: string]: any } = {
    "format_version": 1,
    "overwrite": true,
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
    let json_string = JSON.stringify(character_data)

    const element_section = document.createElement("section")
    element_section.innerHTML = `
<hr/>
<style>
<!--
.btn {
    --bs-btn-padding-x: 0.75rem;
    --bs-btn-padding-y: 0.375rem;
    --bs-btn-font-family: ;
    --bs-btn-font-size: 1rem;
    --bs-btn-font-weight: 400;
    --bs-btn-line-height: 1.5;
    --bs-btn-color: var(--bs-body-color);
    --bs-btn-bg: transparent;
    --bs-btn-border-width: var(--bs-border-width);
    --bs-btn-border-color: transparent;
    --bs-btn-border-radius: var(--bs-border-radius);
    --bs-btn-hover-border-color: transparent;
    --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15),0 1px 1px rgba(0, 0, 0, 0.075);
    --bs-btn-disabled-opacity: 0.65;
    --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
    display: inline-block;
    padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
    font-family: var(--bs-btn-font-family);
    font-size: var(--bs-btn-font-size);
    font-weight: var(--bs-btn-font-weight);
    line-height: var(--bs-btn-line-height);
    color: var(--bs-btn-color);
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
    border-radius: var(--bs-btn-border-radius);
    background-color: var(--bs-btn-bg);
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out
}

@media (prefers-reduced-motion:reduce) {
    .btn {
        transition: none
    }
}

.btn:hover {
    color: var(--bs-btn-hover-color);
    background-color: var(--bs-btn-hover-bg);
    border-color: var(--bs-btn-hover-border-color)
}

.btn-check+.btn:hover {
    color: var(--bs-btn-color);
    background-color: var(--bs-btn-bg);
    border-color: var(--bs-btn-border-color)
}

.btn:focus-visible {
    color: var(--bs-btn-hover-color);
    background-color: var(--bs-btn-hover-bg);
    border-color: var(--bs-btn-hover-border-color);
    outline: 0;
    box-shadow: var(--bs-btn-focus-box-shadow)
}

.btn-check:focus-visible+.btn {
    border-color: var(--bs-btn-hover-border-color);
    outline: 0;
    box-shadow: var(--bs-btn-focus-box-shadow)
}

.btn-check:checked+.btn,.btn.active,.btn.show,.btn:first-child:active,:not(.btn-check)+.btn:active {
    color: var(--bs-btn-active-color);
    background-color: var(--bs-btn-active-bg);
    border-color: var(--bs-btn-active-border-color)
}

.btn-check:checked+.btn:focus-visible,.btn.active:focus-visible,.btn.show:focus-visible,.btn:first-child:active:focus-visible,:not(.btn-check)+.btn:active:focus-visible {
    box-shadow: var(--bs-btn-focus-box-shadow)
}

.btn.disabled,.btn:disabled,fieldset:disabled .btn {
    color: var(--bs-btn-disabled-color);
    pointer-events: none;
    background-color: var(--bs-btn-disabled-bg);
    border-color: var(--bs-btn-disabled-border-color);
    opacity: var(--bs-btn-disabled-opacity)
}

.btn-primary {
    --bs-btn-color: #fff;
    --bs-btn-bg: #0d6efd;
    --bs-btn-border-color: #0d6efd;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #0b5ed7;
    --bs-btn-hover-border-color: #0a58ca;
    --bs-btn-focus-shadow-rgb: 49,132,253;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #0a58ca;
    --bs-btn-active-border-color: #0a53be;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #0d6efd;
    --bs-btn-disabled-border-color: #0d6efd
}

.btn-secondary {
    --bs-btn-color: #fff;
    --bs-btn-bg: #6c757d;
    --bs-btn-border-color: #6c757d;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #5c636a;
    --bs-btn-hover-border-color: #565e64;
    --bs-btn-focus-shadow-rgb: 130,138,145;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #565e64;
    --bs-btn-active-border-color: #51585e;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #6c757d;
    --bs-btn-disabled-border-color: #6c757d
}

.btn-success {
    --bs-btn-color: #fff;
    --bs-btn-bg: #198754;
    --bs-btn-border-color: #198754;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #157347;
    --bs-btn-hover-border-color: #146c43;
    --bs-btn-focus-shadow-rgb: 60,153,110;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #146c43;
    --bs-btn-active-border-color: #13653f;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #198754;
    --bs-btn-disabled-border-color: #198754
}

.btn-info {
    --bs-btn-color: #000;
    --bs-btn-bg: #0dcaf0;
    --bs-btn-border-color: #0dcaf0;
    --bs-btn-hover-color: #000;
    --bs-btn-hover-bg: #31d2f2;
    --bs-btn-hover-border-color: #25cff2;
    --bs-btn-focus-shadow-rgb: 11,172,204;
    --bs-btn-active-color: #000;
    --bs-btn-active-bg: #3dd5f3;
    --bs-btn-active-border-color: #25cff2;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #000;
    --bs-btn-disabled-bg: #0dcaf0;
    --bs-btn-disabled-border-color: #0dcaf0
}

.btn-warning {
    --bs-btn-color: #000;
    --bs-btn-bg: #ffc107;
    --bs-btn-border-color: #ffc107;
    --bs-btn-hover-color: #000;
    --bs-btn-hover-bg: #ffca2c;
    --bs-btn-hover-border-color: #ffc720;
    --bs-btn-focus-shadow-rgb: 217,164,6;
    --bs-btn-active-color: #000;
    --bs-btn-active-bg: #ffcd39;
    --bs-btn-active-border-color: #ffc720;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #000;
    --bs-btn-disabled-bg: #ffc107;
    --bs-btn-disabled-border-color: #ffc107
}

.btn-danger {
    --bs-btn-color: #fff;
    --bs-btn-bg: #dc3545;
    --bs-btn-border-color: #dc3545;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #bb2d3b;
    --bs-btn-hover-border-color: #b02a37;
    --bs-btn-focus-shadow-rgb: 225,83,97;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #b02a37;
    --bs-btn-active-border-color: #a52834;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #dc3545;
    --bs-btn-disabled-border-color: #dc3545
}

.btn-light {
    --bs-btn-color: #000;
    --bs-btn-bg: #f8f9fa;
    --bs-btn-border-color: #f8f9fa;
    --bs-btn-hover-color: #000;
    --bs-btn-hover-bg: #d3d4d5;
    --bs-btn-hover-border-color: #c6c7c8;
    --bs-btn-focus-shadow-rgb: 211,212,213;
    --bs-btn-active-color: #000;
    --bs-btn-active-bg: #c6c7c8;
    --bs-btn-active-border-color: #babbbc;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #000;
    --bs-btn-disabled-bg: #f8f9fa;
    --bs-btn-disabled-border-color: #f8f9fa
}

.btn-dark {
    --bs-btn-color: #fff;
    --bs-btn-bg: #212529;
    --bs-btn-border-color: #212529;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #424649;
    --bs-btn-hover-border-color: #373b3e;
    --bs-btn-focus-shadow-rgb: 66,70,73;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #4d5154;
    --bs-btn-active-border-color: #373b3e;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #212529;
    --bs-btn-disabled-border-color: #212529
}

.btn-group-lg>.btn,.btn-lg {
    --bs-btn-padding-y: 0.5rem;
    --bs-btn-padding-x: 1rem;
    --bs-btn-font-size: 1.25rem;
    --bs-btn-border-radius: var(--bs-border-radius-lg)
}

.btn-group-sm>.btn,.btn-sm {
    --bs-btn-padding-y: 0.25rem;
    --bs-btn-padding-x: 0.5rem;
    --bs-btn-font-size: 0.875rem;
    --bs-btn-border-radius: var(--bs-border-radius-sm)
}
-->
</style>
<div id="rodb_character_information_export">
<h1>RODB:ラグナロクオンライン Webブラウザ拡張</h1>
<button id="button_json_translator" class="btn btn-primary btn-lg">JSON Translatorにて変換</button>
<button id="button_forward_to_rodb_simulator" class="btn btn-success btn-lg" disabled="disabled">RODB Simulatorへ転送</button>

<br/>
<p>JSONデータ</p>
<textarea id="textarea_json" rows="10" style="width: 100%;" readonly>` + json_string + `</textarea>
<br/>
<h4>Created by <a href="https://rodb.aws.0nyx.net">RODB - 0nyx.net</a></h4>
</div>
`
    document.getElementsByTagName("article").item(0)?.appendChild(element_section)

    const textarea_json = document.getElementById('textarea_json')
    const button_json_translator = document.getElementById('button_json_translator')
    const button_forward_to_rodb_simulator = document.getElementById('button_forward_to_rodb_simulator')

    button_json_translator?.addEventListener('click', event => {
        event.preventDefault();

        fetch('https://rodb.aws.0nyx.net/translator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json_string
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true && textarea_json) {
                    json_string = result.translated_data
                    textarea_json.innerHTML = json_string
                    button_forward_to_rodb_simulator?.removeAttribute("disabled")
                }
            })
            .catch((error) => {
                console.log(error)
                if (textarea_json) {
                    textarea_json.innerText = '{"error":"' + error + '"}'
                    button_forward_to_rodb_simulator?.setAttribute("disabled", "disabled")
                }
            })
    })

    button_forward_to_rodb_simulator?.addEventListener('click', event => {
        event.preventDefault();

        fetch('https://rodb.aws.0nyx.net/translator/rodb-simulator', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: json_string
        })
            .then((response) => response.json())
            .then((result) => {
                if (result.success == true) {
                    window.open(result.url)
                }
            })
            .catch((error) => {
                console.log(error)
                if (textarea_json) {
                    textarea_json.innerText = '{"error":"' + error + '"}'
                }
            })
    })
}

main()
