/*
 *     该副本基于koishi框架,仅用于娱乐目的。
 *     Copyright (C) 2023-present yun
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Context, Schema} from 'koishi'
import {removeMultipleStrLeadingSpace} from "./util";

export const name = 'tianxing'

export interface Config {
  key: String
}

export const schema = Schema.object({
  key: Schema.string().required(),
})


export function apply(ctx: Context, config: Config) {

  function getData(path, configs = {}) {
    const url = `http://api.tianapi.com/${path}/index?key=${config.key.trim()}` + Object.keys(configs).filter(lt => configs[lt] != null).map(lt => `&${lt}=${configs[lt]}`).join("")
    return ctx.http.get(url).then(data => {
      if (data.code == "200") {
        return data.newslist
      } else {
        return data.msg
      }
    })
  }

  ctx.command("地区 <area>")
    .usage("地区 重庆")
    .action(async (_, area) => {
      const datas = await getData('citylookup', {area: area})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `名称 : ${data.areacn}
           省份 : ${data.provincecn}
           城市 : ${data.citycn}
           级别 : ${data.areatype == 1 ? "地市级" : "区县级"}
           天气id : ${data.areaid}
           纬度 : ${data.latitude}
           精度 : ${data.longitude}
           行政代码 : ${data.adcode}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("术语 <ct>")
    .usage("术语 IT")
    .action(async (_, ct) => {
      const datas = await getData('pcterm', {word: ct})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `缩写 : ${data.abbr}
            术语 : ${data.type}
            说明 : ${data.notes}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("花语 <flower>")
    .usage("花语 百合花")
    .action(async (_, flower) => {
      const datas = await getData('huayu', {word: flower})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `花名 : ${data.cnflower}
            英文 : ${data.enflower}
            花语 : ${data.flowerlang}
            箴言 : ${data.flowerprov}`
          )
        )
      } else {
        return datas
      }
    })


  ctx.command("节假日 [year]")
    .usage("节假日")
    .action(async (_, year) => {
      year ??= new Date().getFullYear().toString()
      const datas = await getData('jiejiari', {date: year, type: 1})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `名称 : ${data.name}
           节日 : ${data.holiday}
           提示 : ${data.tip}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("地名 <place>")
    .usage("地名 重庆")
    .action(async (_, place) => {
      const datas = await getData('gjdm', {word: place})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `地名 : ${data.area}
            历史 : ${data.introduce}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("电竞 [word] 查询电竞新闻")
    .option("num", "-n [number] 返回数量", {fallback: 3})
    .option("rand", "-r [rand] 随机 1是 0否", {fallback: 1})
    .option("page", "-p [page] 页数", {fallback: 1})
    .usage("可以不填关键字")
    .example("电竞 csgo")
    .action(async ({options}, word) => {

      const page = options.page
      const num = options.num
      const rand = options.rand


      const datas = await getData('esports', {
        page: page,
        num: num,
        rand: rand,
        word: word,
      })
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `标题 : ${data.title}
            时间 : ${data.ctime}
            描述 : ${data.description}
            来源 : ${data.source}
            地址 : ${data.url}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("热搜")
    .option("num", "-n [number] 返回数量", {fallback: 3})
    .action(async ({options}) => {
      const datas = await getData('networkhot')
      if (datas instanceof Object) {
        return datas.slice(0, options.num).map(data => removeMultipleStrLeadingSpace(
            `标题 : ${data.title}
            指数 : ${data.hotnum}
            简介 : ${data.digest}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("时间 <city>")
    .action(async ({options}, city) => {
      const datas = await getData('worldtime', {city: city})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `国家 : ${data.title}
            城市 : ${data.hotnum}
            时区 : ${data.digest}
            时间 : ${data.strtime}
            星期 : ${data.week}
            时间戳 : ${data.timestamp}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("v6 <domain>")
    .action(async ({options}, domain) => {
      const datas = await getData('checkipv6', {domain: domain})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `域名 : ${data.domain}
            开启 : ${data.isipv6 == 1 ? "是" : "否"}
            地址 : ${data.ipv6}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("微信热搜")
    .action(async ({options}, domain) => {
      const datas = await getData('wxhottopic', {})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `排序 : ${data.index}
            话题 : ${data.word}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("收货地址 <address>")
    .action(async ({options}, address) => {
      const datas = await getData('addressparse', {text: address})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `手机 : ${data.mobile}
            姓名 : ${data.name}
            省份 : ${data.province}
            城市 : ${data.city}
            地区 : ${data.district}
            邮编 : ${data.postcode}
            详细 : ${data.detail}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("空气质量 <area>")
    .action(async ({options}, area) => {
      const datas = await getData('aqi', {area: area})
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `地区 : ${data.area}
            二氧化硫 : ${data.so2}
            臭氧 : ${data.o3}
            pm2.5 : ${data.pm2_5}
            首要污染物 : ${data.primary_pollutant}
            一氧化碳 : ${data.co}
            污染数 : ${data.num}
            二氧化氮 : ${data.no2}
            空气质量指数类别 : ${data.quality}
            空气质量指数 : ${data.aqi}
            颗粒物 : ${data.pm10}
            臭氧 : ${data.o3_8h}
            更新时间 : ${data.time}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("宠物 [name]")
    .option("type", "-t [type] 0猫科、1犬类、2爬行类、3小宠物类、4水族类")
    .option("page", "-p <page> 翻页", {fallback: 1})
    .option("num", "-n <num> 每页数量", {fallback: 3})
    .action(async ({options}, name) => {

      const datas = await getData('pet', {
        type: options.type,
        name: name,
        page: options.page,
        num: options.num
      })

      function pettype(type) {
        let result = ""
        switch (type) {
          case 0:
            result = "猫科"
            break;
          case 1:
            result = "犬类"
            break;
          case 2:
            result = "爬行类"
            break;
          case 3:
            result = "小宠物类"
            break;
          case 4:
            result = "水族类"
            break;
          default:
            result = "未知"
        }
        return result
      }

      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `类型 : ${pettype(data.pettype)}
            名称 : ${data.name}
            性格 : ${data.characters}
            祖籍 : ${data.nation}
            易患病 : ${data.easyOfDisease}
            寿命 : ${data.life}
            价格 : ${data.price}
            描述 : ${data.desc}
            体态特征 : ${data.feature}
            特点 : ${data.characterFeature}
            照顾须知 : ${data.careKnowledge}
            喂养注意 : ${data.feedPoints}
            详细来源 : ${data.url}
            封面图片 : ${data.coverURL}`
          )
        )
      } else {
        return datas
      }
    })

  ctx.command("地区新闻 <areaname> [word] ")
    .option("page", "-p [page] 翻页", {fallback: 1})
    .action(async ({options}, areaname,word) => {
      const datas = await getData('areanews', {
        areaname: areaname,
        word: word,
        page: options.page
      })
      if (datas instanceof Object) {
        return datas.map(data => removeMultipleStrLeadingSpace(
            `标题 : ${data.title}
            配图 : ${data.picUrl}
            描述 : ${data.description}
            来源 : ${data.source}
            链接 : ${data.url}
            时间 : ${data.ctime}`
          )
        )
      } else {
        return datas
      }
    })
}
