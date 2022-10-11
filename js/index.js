/**
 * @Description:
 * @CreateAuthor: Mr_MN
 * @CreateDate: 2020-08-11 11:01
 * @LastEditors: Administrator
 * @LastEditTime: 2020-08-11 11:01
 **/

//生成随机数
function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}

$(function () {
    //第一级地图的ID、Name、Json数据（以中国地图为例）
    var firstLevelId = 100000;
    var firstLevelName = 'china';
    var firstLevelJson=null;

    //记录父级ID、Name
    var parentStack = [];
    var parentId = firstLevelId;
    var parentName = firstLevelName;

    var myChart = echarts.init(document.getElementById('mapChart'));

    $.get('./json/map/' + firstLevelId + '.json', function (mapJson) {
        firstLevelJson=mapJson;
        registerAndsetOption(myChart, firstLevelId, firstLevelName, mapJson, false);

        myChart.on('click', function (param) {
            var cityId = cityMap[param.name];
            if (cityId) {//代表有下级地图
                $.get('./json/map/' + cityId + '.json', function (mapJson) {
                    registerAndsetOption(myChart, cityId, param.name, mapJson, true)
                })
            }else if(parentId/100%100>0){//代表有区县
                $.get('./json/map/' + parentId + '.json', function (mapJson) {
                    registerAndsetOption(myChart, cityId, param.name, getCountyJson(mapJson,param.name), true)
                })
            } else {
                //没区县地图，回到初始地图，并将parentStack清空
                // registerAndsetOption(myChart, firstLevelId, firstLevelName, firstLevelJson, false);
                // parentStack = [];
                // parentId = firstLevelId;
                // parentName = firstLevelName;

                //暂无区县以下地图数据
                alert("暂无区县以下地图数据")
            }
        });
    });


    function registerAndsetOption(myChart, id, name, mapJson, flag) {
        echarts.registerMap(name, mapJson);
        myChart.setOption({
            backgroundColor: '#013954',
            tooltip: {
                show:false,
                trigger:'item'
            },
            visualMap: {
                show: true,
                min: 0,
                max: 200,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'], // 文本，默认为数值文本
                calculable: true,
                seriesIndex: [0],
                inRange: {
                    color: ['#1e7dff', '#3192ff','#2badff','#51c4ff','#79d8ff']// 渐变色范围
                },
                textStyle: {
                    color: '#fff'
                }
            },
            series: [{
                type: 'map',
                map: name,
                itemStyle: {
                    normal: {
                        areaColor: 'rgba(23, 27, 57,0)',
                        borderColor: "#a7e4e6",
                        borderWidth: 1,
                    },
                },
                label: {
                    show: true,
                    textStyle:{
                        backgroundColor:'transparent',
                        color: '#fff',
                        fontWeight: 'normal',
                        fontSize: 12,
                        fontFamily:'MicrosoftYaHei'
                    }
                },
                data: initMapData(mapJson)
            }]
        });

        if (flag) {//往parentStack里添加parentId，parentName,返回上一级使用
            parentStack.push({
                mapId: parentId,
                mapName: parentName
            });
            parentId = id;
            parentName = name;
        }
    }

    /**
     * 根据Json里的数据构造Echarts地图所需要的数据
     * @param {} mapJson
     */

    function initMapData(mapJson) {
        var mapData = [];
        for (var i = 0; i < mapJson.features.length; i++) {
            mapData.push({
                name: mapJson.features[i].properties.name,
                value: randomNum(1, 300)
            })
        }
        return mapData;
    }

    //获取区县级的Json数据
    var getCountyJson = function (data,mapName) {
        if(typeof(data)=="string"){
            var data=$.parseJSON( data );
        }
        var countryJson = {};
        countryJson.features = [];
        for(var i=0;i<data.features.length;i++){
            var cityname = data.features[i].properties.name;
            if(mapName == cityname){
                countryJson.features.push(data.features[i])
            }
        }
        return countryJson;
    };
    /**
     * 返回上一级地图
     */
    $('.backBtn').click(function () {
        if (parentStack.length != 0) {//如果有上级目录则执行
            var map = parentStack.pop();
            $.get('./json/map/' + map.mapId + '.json', function (mapJson) {
                registerAndsetOption(myChart, map.mapId, map.mapName, mapJson, false);
                //返回上一级后，父级的ID、Name随之改变
                parentId = map.mapId;
                parentName = map.mapName;
            })
        }
    });
});


