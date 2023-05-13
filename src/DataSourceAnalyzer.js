import {Card, NextLine, Page, PersonalResult, Text} from "./Components";
import React, {Fragment, useState} from "react";
import {Button, List, notification, Space, Spin, Switch, Table, Tooltip} from "antd";

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
                <Button href={"/#/"} type={"primary"} ghost={true}><Text>回到主页</Text></Button>
                <center><Text type={"h1"}>ExamResultViewer - DataSourceAnalyzer</Text></center>
                <center><Text>学业水平质量测试结果分析器 - 数据源文件分析器</Text></center>
                <Text type={"h2"}>选择数据源文件</Text>
                <NextLine/>
                <input type={"file"} id={"excel_file_input"} accept={".ervds"} onChange={(e) => {
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
                <Space>
                    <Switch id={"calculate_personal_data"} defaultChecked={true}></Switch>
                    <Text>计算个人数据。关闭它曾经能显著提高速度，但现在不必了。</Text>
                </Space>
                <NextLine/>
                <Button type={"primary"} loading={loading} id={"start_analyze"} onClick={() => {
                    start_loading();
                    setTimeout(() => {
                        analyze_data();
                        stop_loading();
                    }, 400);
                }}>开始分析</Button>
            </Card>
            <NextLine size={"30px"}/>
            <Spin spinning={loading} wrapperClassName={"border_radius"}>
                <Card>
                    <Text type={"h2"}>数据总览</Text>
                    <NextLine/>
                    {data_overview}
                    <NextLine/>
                    <Text type={"h2"}>个人数据</Text>
                    <NextLine/>
                    <Text>由于列表使用了分页技术以降低渲染时卡顿，您不可以使用浏览器的查找功能。</Text>
                    <NextLine/>
                    <Text>双击卡片<b>空白部分</b>可以复制卡片为图片，复制到剪贴板里的图片可以使用Ctrl+V快捷键粘贴至微信、Word等软件中。<s>可以将其发送给家长，很有纪念意义，不是吗？</s></Text>
                    <NextLine/>
                    {data_personal}
                </Card>
            </Spin>
        </Page>
    </>)

    function start_loading() {
        set_loading(true);
    }

    function stop_loading() {
        set_loading(false);
    }


    function filtrate_data_source_content(data_source_content) {
        for (var student_id in data_source_content.student) {
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
                data_source_content.student[student_id].sum_score = score
            } else {
                data_source_content.student[student_id].sum_score = -1;
            }
        }
        return data_source_content;
    }

    function analyze_data() {
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

        function get_rank(data, data_list) {
            var left = 0, right = data_list.length - 1;
            var ans = -2;
            while (left <= right) {
                var mid = parseInt((left + right) / 2);
                if (data_list[mid] === data) {
                    ans = mid;
                }
                if (data_list[mid] > data) {
                    left = mid + 1;
                    ans = mid;
                } else {
                    right = mid - 1;
                }
            }
            return ans + 1;
        }

        function render_uncounted_subjects(uncounted_subjects) {
            let result = "";
            for (var i = 0; i < uncounted_subjects.length; i++) {
                result += uncounted_subjects[i];
                if (i !== (uncounted_subjects.length - 1)) {
                    result += "、";
                }
            }
            return result;
        }

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
        var handled_data = filtrate_data_source_content(data_source_content);
        let subject_scores = [];//每一科的所有分数，用于计算排名。
        let uncounted_subjects = [];
        var overview_table_data = [];
        let full_score = 0;
        for (var subject_id in handled_data.subject) {
            subject_scores.push([]);
            if (handled_data.subject[subject_id].is_counted === "true") {
                full_score += handled_data.subject[subject_id].full_score;
            } else {
                uncounted_subjects.push(handled_data.subject[subject_id].subject_name);
            }
            //console.log(handled_data.subject[subject_id].is_counted,handled_data.subject[subject_id].is_counted==="true");
            let valid_cnt = 0, sum_score = 0;
            let max_score = -1, min_score = 0x3fffffff;
            let max_score_who = [], min_score_who = [];
            for (var student_id in handled_data.student) {
                var score = handled_data.student[student_id].score[subject_id];
                if (score !== -1) {
                    valid_cnt++;
                    subject_scores[subject_id].push(score);
                    sum_score += score;
                    if (score > max_score) {
                        max_score = score;
                        max_score_who = [];
                    }
                    if (score === max_score) {
                        max_score_who.push(join_student_info(handled_data.student[student_id].name, handled_data.student[student_id].id, handled_data.student[student_id]["class"]));
                    }
                    if (score < min_score) {
                        min_score = score;
                        min_score_who = [];
                    }
                    if (score === min_score) {
                        min_score_who.push(join_student_info(handled_data.student[student_id].name, handled_data.student[student_id].id, handled_data.student[student_id]["class"]));
                    }
                }
            }
            subject_scores[subject_id] = subject_scores[subject_id].sort(function (a, b) {
                return b - a;
            });
            let new_data = null;
            if (valid_cnt === 0) {
                new_data = {
                    "name": handled_data.subject[subject_id].subject_name,
                    "valid_cnt": 0,
                    "full_score": handled_data.subject[subject_id].full_score,
                    "average_score": -1,
                    "max_score": -1,
                    "min_score": -1
                }
            } else {
                new_data = {
                    "name": handled_data.subject[subject_id].subject_name,
                    "valid_cnt": valid_cnt,
                    "full_score": handled_data.subject[subject_id].full_score,
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
            subject_scores.push([]);
            let valid_cnt = 0, sum_score = 0;
            let max_score = -1, min_score = 0x3fffffff;
            let max_score_who = [], min_score_who = [];
            for (student_id in handled_data.student) {
                let now_student = handled_data.student[student_id];
                if (now_student.sum_score !== -1) {
                    valid_cnt++;
                    score = now_student.sum_score;
                    subject_scores[subject_scores.length - 1].push(score);
                    sum_score += score;
                    if (score > max_score) {
                        max_score = score;
                        max_score_who = [];
                    }
                    if (score === max_score) {
                        max_score_who.push(join_student_info(handled_data.student[student_id].name, handled_data.student[student_id].id, handled_data.student[student_id]["class"]));
                    }
                    if (score < min_score) {
                        min_score = score;
                        min_score_who = [];
                    }
                    if (score === min_score) {
                        min_score_who.push(join_student_info(handled_data.student[student_id].name, handled_data.student[student_id].id, handled_data.student[student_id]["class"]));
                    }
                }
            }
            subject_scores[subject_scores.length - 1] = subject_scores[subject_scores.length - 1].sort(function (a, b) {
                return b - a;
            });
            let new_data;
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
                <Text>共{JSON.stringify(handled_data.student.length)}条数据。</Text>
                <NextLine/>
                <Table columns={overview_table_column} dataSource={overview_table_data} pagination={false}/>
            </>);
        //计算个人成绩
        if (document.getElementById("calculate_personal_data").ariaChecked === "false") {
            set_data_personal(<NoPersonalData onStart={() => {
                start_loading();
            }} onMiddle={() => {
                var a = document.getElementById("calculate_personal_data");
                if (a.ariaChecked === "false") {
                    a.click();
                    a.ariaChecked = "true";
                }
                analyze_data();
            }} onEnd={() => stop_loading()}/>);
            return;
        }
        let personal_list_data = [];
        for (var i in handled_data.student) {
            var now_student = handled_data.student[i];
            let now_personal_data = {};
            now_personal_data["exam_name"] = handled_data.name;
            now_personal_data["name"] = now_student.name;
            now_personal_data["id"] = now_student.id;
            now_personal_data["class"] = now_student["class"];
            now_personal_data["subject"] = [];
            for (var j in handled_data.subject) {
                now_personal_data["subject"].push({
                    "name": handled_data.subject[j].subject_name,
                    "full_score": handled_data.subject[j].full_score,
                    "score": now_student.score[j],
                    "rank": get_rank(now_student.score[j], subject_scores[j]),
                    "valid_cnt": subject_scores[j].length
                });
            }
            //计算总分
            if (now_student.sum_score !== -1) {
                score = now_student.sum_score;
                now_personal_data["subject"].push({
                        "name": "总分",
                        "full_score": full_score,
                        "score": score,
                        "rank": get_rank(score, subject_scores[subject_scores.length - 1]),
                        "valid_cnt": subject_scores[subject_scores.length - 1].length
                    }
                )
            } else {
                now_personal_data["subject"].push({
                        "name": "总分",
                        "full_score": full_score,
                        "score": -1,
                        "rank": get_rank(score, subject_scores[subject_scores.length - 1]),
                        "valid_cnt": subject_scores[subject_scores.length - 1].length
                    }
                )
            }
            personal_list_data.push(now_personal_data);
        }
        console.log(personal_list_data);
        let uncounted_subjects_dom = (uncounted_subjects.length === 0) ? (<></>) : (
            <>
                <NextLine size={"0px"}/>
                <Text>注：{render_uncounted_subjects(uncounted_subjects)}科目不计入总分。</Text>
            </>
        )
        set_data_personal(
            <List pagination={{"position": "bottom", "align": "center", "pageSize": 24, "showQuickJumper": true}}
                  grid={{gutter: 16, column: 4}}
                  dataSource={personal_list_data} renderItem={(item) => (
                <List.Item>
                    <PersonalResult data={item} uncounted_subjects_dom={uncounted_subjects_dom}/>
                </List.Item>
            )}/>
        );
    }
}

function NoPersonalData(props) {
    const [loading, set_loading] = useState(false);
    return (<>
        <Text>计算个人数据开关已关闭。</Text>
        <Button type={"primary"} loading={loading} onClick={() => {
            set_loading(true);
            props.onStart();
            setTimeout(() => {
                props.onMiddle();
                props.onEnd();
                set_loading(false);
            }, 400);
        }}>重新开启并计算。</Button>
    </>);
}