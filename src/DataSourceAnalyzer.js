import {Card, NextLine, Page, PersonalResult, Text} from "./Components";
import React, {Fragment, useState} from "react";
import {Button, List, notification, Table, Tooltip} from "antd";

let data_source_content = null;
export default function DataSourceAnalyzer() {
    const [notification_api, context_holder] = notification.useNotification();
    let [data_overview, set_data_overview] = useState(<Fragment/>);
    let [data_personal, set_data_personal] = useState(<Fragment/>);
    let [loading, set_loading] = useState(false);
    return (<>
        {context_holder}
        <Page>
            <Card>
                <center><Text type={"h1"}>ExamResultViewer - DataSourceAnalyzer</Text></center>
                <center><Text>学业水平质量测试结果分析器 - 数据源文件分析器</Text></center>
                <Text type={"h2"}>选择数据源文件</Text>
                <NextLine/>
                <input type={"file"} id={"excel_file_input"} onChange={(e) => {
                    try {
                        console.log(e);
                        var files = e.target.files;
                        if (files.length === 0) {
                            return;
                        }
                        var f = files[0];
                        //此处支持的格式可以自己设置
                        if (!/\.ervds$/g.test(f.name)) {
                            notification_api["error"]({
                                "message": "文件格式不支持", "description": "仅支持ervds格式。"
                            });
                            return;
                        }
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            data_source_content = JSON.parse(e.target.result);
                            console.log(data_source_content);
                        };
                        reader.readAsText(f, "UTF-8");
                    } catch (e) {
                        console.log(e);
                        notification_api["error"]({
                            "message": "读取文件时出错", "description": "读取文件时出错。"
                        });
                    }
                }}/>
                <NextLine/>
                <Button type={"primary"} onClick={() => {
                    start_loading();
                    analyze_data();
                    stop_loading();
                }} loading={loading}>开始分析</Button>
            </Card>
            <NextLine size={"30px"}/>
            <Card>
                <Text type={"h2"}>数据总览</Text>
                <NextLine/>
                {data_overview}
                <NextLine/>
                <Text type={"h2"}>个人数据</Text>
                <NextLine/>
                {data_personal}
            </Card>
        </Page>
    </>)

    function start_loading() {
        set_loading(true);
    }

    function stop_loading() {
        set_loading(false);
    }

    function join_student_info(name, id, stu_class) {
        return `${name}-${id}-${stu_class}`;
    }

    function render_student_list_in_tooltip(student_list) {
        let res = "";
        for (var i in student_list) {
            res += student_list[i] + ((parseInt(i) === (student_list.length - 1)) ? "。" : "，");
        }
        return res;
    }
    function get_rank(data,data_list)
    {
        var left=0,right=data_list.length-1;
        var ans=-2;
        while(left<=right)
        {
            var mid=(left+right)/2;
            if(data_list[mid]==data)
            {
                ans=mid;
            }
            if(data_list[mid]>=data)
            {
                left=mid+1;
            }
            else
            {
                right=mid-1;
            }
        }
        return ans+1;
    }

    function analyze_data() {
        //计算总览
        var overview_table_column = [{
            "title": <Text bold={true}>科目名称</Text>,
            "dataIndex": "name",
            "key": "name",
            render: (_, record) => (<Text>{record.name}</Text>)
        }, {
            "title": <Text bold={true}>有效成绩数</Text>,
            "dataIndex": "valid_cnt",
            "key": "valid_cnt",
            render: (_, record) => (<Text>{JSON.stringify(record.valid_cnt)}</Text>)
        }, {
            "title": <Text bold={true}>满分</Text>,
            "dataIndex": "full_score",
            "key": "full_score",
            render: (_, record) => (<Text>{JSON.stringify(record.full_score)}</Text>)
        }, {
            "title": <Text bold={true}>平均分</Text>,
            "dataIndex": "average_score",
            "key": "average_score",
            render: (_, record) => record.valid_cnt === 0 ? (<Text>无有效数据</Text>) : (
                <Text>{JSON.stringify(record.average_score)}</Text>)
        }, {
            "title": <Text bold={true}>最高分</Text>,
            "dataIndex": "max_score",
            "key": "max_score",
            render: (_, record) => record.valid_cnt === 0 ? (<Text>无有效数据</Text>) : (
                <Tooltip title={render_student_list_in_tooltip(record.max_score_who)}>
                    <Text>
                        {JSON.stringify(record.max_score)}
                    </Text>
                </Tooltip>)
        }, {
            "title": <Text bold={true}>最低分</Text>,
            "dataIndex": "min_score",
            "key": "min_score",
            render: (_, record) => record.valid_cnt === 0 ? (<Text>无有效数据</Text>) : (
                <Tooltip title={render_student_list_in_tooltip(record.min_score_who)}>
                    <Text>
                        {JSON.stringify(record.min_score)}
                    </Text>
                </Tooltip>)
        }];
        var overview_table_data = [];
        let full_score = 0;
        for (var subject_id in data_source_content.subject) {
            if (data_source_content.subject[subject_id].is_counted === "true") {
                full_score += data_source_content.subject[subject_id].full_score;
            }
            //console.log(data_source_content.subject[subject_id].is_counted,data_source_content.subject[subject_id].is_counted==="true");
            let valid_cnt = 0, sum_score = 0;
            let max_score = -1, min_score = 0x3fffffff;
            let max_score_who = [], min_score_who = [];
            for (var student_id in data_source_content.student) {
                var score = data_source_content.student[student_id].score[subject_id];
                if (score !== -1) {
                    valid_cnt++;
                    sum_score += score;
                    if (score > max_score) {
                        max_score = score;
                        max_score_who = [];
                    }
                    if (score === max_score) {
                        max_score_who.push(join_student_info(data_source_content.student[student_id].name, data_source_content.student[student_id].id, data_source_content.student[student_id]["class"]));
                    }
                    if (score < min_score) {
                        min_score = score;
                        min_score_who = [];
                    }
                    if (score === min_score) {
                        min_score_who.push(join_student_info(data_source_content.student[student_id].name, data_source_content.student[student_id].id, data_source_content.student[student_id]["class"]));
                    }
                }
            }
            let new_data = null;
            if (valid_cnt === 0) {
                new_data = {
                    "name": data_source_content.subject[subject_id].subject_name,
                    "valid_cnt": 0,
                    "full_score": data_source_content.subject[subject_id].full_score,
                    "average_score": -1,
                    "max_score": -1,
                    "min_score": -1
                }
            } else {
                new_data = {
                    "name": data_source_content.subject[subject_id].subject_name,
                    "valid_cnt": valid_cnt,
                    "full_score": data_source_content.subject[subject_id].full_score,
                    "average_score": sum_score / valid_cnt,
                    "max_score": max_score,
                    "max_score_who": max_score_who,
                    "min_score": min_score,
                    "min_score_who": min_score_who
                }
            }
            //console.log(new_data);
            overview_table_data.push(new_data);
        }
        //计算总分
        {
            let valid_cnt = 0, sum_score = 0;
            let max_score = -1, min_score = 0x3fffffff;
            let max_score_who = [], min_score_who = [];
            for (student_id in data_source_content.student) {
                let now_student = data_source_content.student[student_id];
                let score = 0, valid = false;
                for (var j in now_student.score) {
                    let data = now_student.score[j];
                    if (data !== -1 && data_source_content.subject[j].is_counted === "true") {
                        score += data;
                        valid = true;
                    }
                }
                if (valid) {
                    valid_cnt++;
                    sum_score += score;
                    if (score > max_score) {
                        max_score = score;
                        max_score_who = [];
                    }
                    if (score === max_score) {
                        max_score_who.push(join_student_info(data_source_content.student[student_id].name, data_source_content.student[student_id].id, data_source_content.student[student_id]["class"]));
                    }
                    if (score < min_score) {
                        min_score = score;
                        min_score_who = [];
                    }
                    if (score === min_score) {
                        min_score_who.push(join_student_info(data_source_content.student[student_id].name, data_source_content.student[student_id].id, data_source_content.student[student_id]["class"]));
                    }
                }
            }
            let new_data = null;
            if (valid_cnt === 0) {
                new_data = {
                    "name": "总分",
                    "valid_cnt": 0,
                    "full_score": full_score,
                    "average_score": -1,
                    "max_score": -1,
                    "min_score": -1
                }
            } else {
                new_data = {
                    "name": "总分",
                    "valid_cnt": valid_cnt,
                    "full_score": full_score,
                    "average_score": sum_score / valid_cnt,
                    "max_score": max_score,
                    "max_score_who": max_score_who,
                    "min_score": min_score,
                    "min_score_who": min_score_who
                }
            }
            //console.log(new_data);
            overview_table_data.push(new_data);
        }
        //console.log(overview_table_data);
        set_data_overview(
            <>
                <Text>共{JSON.stringify(data_source_content.student.length)}条数据。</Text>
                <NextLine/>
                <Table columns={overview_table_column} dataSource={overview_table_data} pagination={false}/>
            </>);
        //计算个人成绩
        let personal_list_data = [];
        let subject_scores = [];//每一科的所有分数，用于计算排名。
        for (var i in data_source_content.subject) {
            let now_subject_scores = [];
            for (var j in data_source_content.student) {
                var score = data_source_content.student[j].score[i];
                if (score !== -1) {
                    now_subject_scores.push(score);
                }
            }
            now_subject_scores = now_subject_scores.sort(function (a, b) {
                return b - a;
            });
            subject_scores.push(now_subject_scores);
        }
        //console.log(subject_scores);
        for (var i in data_source_content.student) {
            var now_student=data_source_content.student[i];
            let now_personal_data={};
            now_personal_data["name"]=now_student.name;
            now_personal_data["id"]=now_student.id;
            now_personal_data["class"]=now_student["class"];
            now_personal_data["subject"]=[];
            for(var j in data_source_content.subject)
            {
                now_personal_data["subject"].push({
                    "name":data_source_content.subject[j].subject_name,
                    "full_score":data_source_content.subject[j].full_score,
                    "score":now_student.score[j],
                    "rank":get_rank(now_student.score[j],subject_scores[j]),
                    "valid_cnt":subject_scores[j].length
                });
            }
            personal_list_data.push(now_personal_data);
        }
        console.log(personal_list_data);
        set_data_personal(
            <List grid={{gutter:4,column:4}} dataSource={personal_list_data} renderItem={(item)=>(
                <List.Item>
                    <PersonalResult data={item}/>
                </List.Item>
            )}/>
        );
    }
}