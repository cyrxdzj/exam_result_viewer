import {Card, NextLine, Page, Text} from "./Components";
import {Button, Form, Input, InputNumber, notification, Space, Switch, Table} from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";
import * as XLSX from "xlsx";


// Start Copying
const EditableContext = React.createContext(null);
const EditableRow = ({index, ...props}) => {
    const [form] = Form.useForm();
    return (<Form form={form} component={false}>
        <EditableContext.Provider value={form}>
            <tr {...props} />
        </EditableContext.Provider>
    </Form>);
};
const EditableCell = ({
                          title, editable, children, dataIndex, record, handleSave, ...restProps
                      }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({
                ...record, ...values,
            });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    let childNode = children;
    if (editable) {
        childNode = editing ? (<Form.Item
            style={{
                margin: 0,
            }}
            name={dataIndex}
            rules={[{
                required: true, message: `${title} is required.`,
            },]}
        >
            <Input ref={inputRef} onPressEnter={save} onBlur={save}/>
        </Form.Item>) : (<div
            onClick={toggleEdit}
        >
            {children}
        </div>);
    }
    return <td {...restProps}>{childNode}</td>;
};
//End Copying
let all_data = null;
let workbook_content = null;
const re_letter = /^[A-Z]+$/;//判断是否均为大写字母的正则表达式
const re_float = /^[0-9.]+$/;//判断是否均为数字的正则表达式


export default function DataSourceGenerator() {
    const [notification_api, context_holder] = notification.useNotification();
    let [subject_data_source, set_subject_data_source] = useState([]);
    let [data_source_cnt, set_data_source_cnt] = useState(0);
    let [loading, set_loading] = useState(false);
    let [disabled, set_disabled] = useState(true);
    let [log_content, set_log_content] = useState("");
    let [file_url, set_file_url] = useState("#");
    let [file_name, set_file_name] = useState("");

    function add_log(content, flag = "add") {
        let new_content = "";
        if (flag === "add") {
            new_content = log_content + content;
        } else if (flag === "clear") {
            new_content = content;
        } else if (flag === "del_line") {
            let temp = "";
            let lines = log_content.split("\n");
            for (var i = 0; i < lines.length - 2; i++) {
                temp += lines[i] + "\n";
            }
            temp += content;
            new_content = temp;
        }
        set_log_content(new_content);
        log_content = new_content;
    }

    function start_generate() {
        set_loading(true);
        set_disabled(true);
    }

    function stop_generate() {
        set_loading(false);
        set_disabled(all_data === null);
    }

    const default_columns = [{
        title: <Text bold={true}>科目名称</Text>, dataIndex: 'subject_name', key: 'subject_name',
    }, {
        title: <Text bold={true}>满分</Text>, dataIndex: 'full_score', key: 'full_score',
    }, {
        title: <Text bold={true}>是否计入总分</Text>, dataIndex: 'is_counted', key: 'is_counted'
    }, {
        title: <Text bold={true}>列号</Text>, dataIndex: 'col_id', key: 'col_id'
    }, {
        title: <Text bold={true}>操作</Text>,
        dataIndex: 'operation',
        key: 'operation',
        render: (_, record) => subject_data_source.length >= 1 ? (<Space>
            <Button type={"text"} danger={true} onClick={() => delete_row(record.key)}>删除</Button>
        </Space>) : null,
    }];

    //Start Copying

    const save_subject = (row) => {
        const newData = [...subject_data_source];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item, ...row,
        });
        set_subject_data_source(newData);
        console.log("On save.");
    };
    const components = {
        body: {
            row: EditableRow, cell: EditableCell,
        },
    };
    const columns = default_columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col, onCell: (record) => ({
                record, editable: col.editable, dataIndex: col.dataIndex, title: col.title, handleSave: save_subject,
            }),
        };
    });
    //End Copying
    return (<>
        {context_holder}
        <Page>
            <Card>
                <Button href={"/#/"} type={"primary"} ghost={true}><Text>回到主页</Text></Button>
                <center><Text type={"h1"}>ExamResultViewer - DataSourceGenerator</Text></center>
                <center><Text>学业水平质量测试结果分析器 - 数据源文件生成器</Text></center>
                <Text type={"h2"}>一、选择表格文件与工作表</Text>
                <NextLine/>
                <input type={"file"} id={"excel_file_input"} accept={".xls,.xlsx"} onChange={(e) => {
                    try {
                        console.log(e);
                        var files = e.target.files;
                        if (files.length === 0) {
                            return;
                        }
                        var f = files[0];
                        //此处支持的格式可以自己设置
                        if (!/\.xls$/g.test(f.name) && !/\.xlsx$/g.test(f.name)) {
                            notification_api["error"]({
                                "message": "文件格式不支持", "description": "仅支持xls或xlsx格式。"
                            });
                            return;
                        }
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var data = e.target.result;
                            workbook_content = XLSX.read(data, {type: 'binary'});
                            console.log(workbook_content);
                        };
                        reader.readAsBinaryString(f);
                    } catch (e) {
                        console.log(e);
                        notification_api["error"]({
                            "message": "读取文件时出错", "description": "读取文件时出错。"
                        });
                    }
                }}/>
                <NextLine/>
                <Input addonBefore={"工作表名"} id={"worktable_name_input"}/>
                <NextLine/>
                <Input addonBefore={"数据源名"} id={"data_src_name_input"}
                       placeholder={"如：2020-2022届九年级下学期一模，应尽可能详细。该项将会展示在个人数据卡片上，因此请命名为考试名称。"}/>
                <NextLine/>
                <Text type={"h2"}>二、选择数据范围与来源</Text>
                <NextLine/>
                <Space>
                    <Text>从</Text>
                    <InputNumber addonBefore={<Text>第</Text>} addonAfter={<Text>行</Text>} step={1}
                                 id={"from_line_input"}/>
                    <Text>到</Text>
                    <InputNumber addonBefore={<Text>第</Text>} addonAfter={<Text>行</Text>} step={1}
                                 id={"to_line_input"}/>
                </Space>
                <NextLine/>
                <Space>
                    <Input addonBefore={<Text>姓名所在列</Text>} id={"name_col_id"}/>
                    <Input addonBefore={<Text>考号所在列</Text>} id={"id_col_id"}/>
                    <Input addonBefore={<Text>班级所在列</Text>} id={"class_col_id"}/>
                </Space>
                <NextLine/>
                <Text>列号为字母，如A1的列号为A。</Text>
                <NextLine/>
                <Text type={"h2"}>三、配置科目</Text>
                <NextLine/>
                <Table components={components} dataSource={subject_data_source} columns={columns}
                       id={"subject_table"}
                       pagination={false}/>
                <NextLine/>
                <Space>
                    <Button type={"primary"} onClick={function () {
                        new_subject();
                    }}>新增科目</Button>
                </Space>
                <NextLine/>
                <Text type={"h2"}>四、生成数据源文件</Text>
                <NextLine/>
                <Space>
                    <Button type={"primary"} onClick={() => {
                        start_generate();
                        generate_data_source();
                        stop_generate();
                    }} id={"generate_button"} loading={loading}>生成数据源文件</Button>
                    <Button type={"primary"} disabled={disabled} id={"download_button"}
                            href={file_url} download={file_name}>保存数据源文件</Button>
                </Space>
                <NextLine/>
                <Input.TextArea disabled={true} id={"log_area"} style={{"height": "100px"}} value={log_content}/>
                <NextLine/>
                <Text type={"h2"}>五、分析数据源文件</Text>
                <NextLine/>
                <Text>数据源文件生成后，您可以分析它。</Text>
                <NextLine/>
                <Button type={"primary"} href={"/#/analyze"}>分析数据源文件</Button>
            </Card>
        </Page>
    </>);

    function delete_row(key) {
        const new_data = subject_data_source.filter((item) => item.key !== key);
        set_subject_data_source(new_data);
        console.log(new_data);
    }

    function new_subject() {
        const new_data = {
            "subject_name": <Input id={"subject_name_input_" + data_source_cnt.toString()}/>,
            "full_score": <InputNumber id={"full_score_input_" + data_source_cnt.toString()}/>,
            "is_counted": <Switch id={"is_counted_switch_" + data_source_cnt.toString()} defaultChecked={true}/>,
            "col_id": <Input id={"col_id_input_" + data_source_cnt.toString()}/>,
            "operation": null,
            "key": data_source_cnt
        };
        set_subject_data_source([...subject_data_source, new_data]);
        set_data_source_cnt(data_source_cnt + 1);
        subject_data_source = [...subject_data_source, new_data];
        data_source_cnt = data_source_cnt + 1;
        console.log(subject_data_source);
    }

    function generate_data_source() {
        add_log("开始生成数据源文件。\n", "clear");
        console.log(log_content);
        try {
            let subject_list = get_subjects();
            const worktable_name = document.getElementById("worktable_name_input").value;
            const data_src_name = document.getElementById("data_src_name_input").value;
            let from_line = document.getElementById("from_line_input").value;
            let to_line = document.getElementById("to_line_input").value;
            let name_col_id = document.getElementById("name_col_id").value.toUpperCase();
            let id_col_id = document.getElementById("id_col_id").value.toUpperCase();
            let class_col_id = document.getElementById("class_col_id").value.toUpperCase();
            if (workbook_content == null) {
                notification_api["error"]({
                    "message": "未选择有效的文件", "description": "您似乎没有选择有效的Excel文件。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            if (worktable_name === "") {
                notification_api["error"]({
                    "message": "未填写工作表名", "description": "请填写数据所在的工作表名。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            if (data_src_name === "") {
                notification_api["error"]({
                    "message": "未填写数据源名", "description": "请填写数据源名。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            if (workbook_content.SheetNames.indexOf(worktable_name) === -1) {
                notification_api["error"]({
                    "message": "工作表名无效", "description": "在Excel文件里找不到这个工作表。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            if (from_line === "" || to_line === "") {
                notification_api["error"]({
                    "message": "数据无效", "description": "起止行数无效。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            from_line = parseFloat(from_line);
            to_line = parseFloat(to_line);
            if ((from_line % 1) || (to_line % 1) || from_line > to_line) {
                notification_api["error"]({
                    "message": "数据无效", "description": "起止行数无效。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            from_line = parseInt(from_line);
            to_line = parseInt(to_line);
            if ((!re_letter.test(name_col_id)) || (!re_letter.test(id_col_id)) || (!re_letter.test(class_col_id))) {
                notification_api["error"]({
                    "message": "数据无效", "description": "关键数据列号无效。"
                });
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            if (!check_subjects(subject_list)) {
                add_log("生成结束。未能成功生成数据源文件。\n");
                return;
            }
            let worktable_content = workbook_content.Sheets[worktable_name];
            console.log(worktable_content);
            let student_list = [];
            add_log("\n");
            for (var now_row = from_line; now_row <= to_line; now_row++) {
                add_log(`正在生成，第${now_row - from_line + 1}行，共${to_line - now_row + 1}行。\n`, "del_line");
                let score = [];
                let now_student = {
                    "name": worktable_content[name_col_id + now_row.toString()].w,
                    "id": worktable_content[id_col_id + now_row.toString()].w,
                    "class": worktable_content[class_col_id + now_row.toString()].w,
                    "score": null
                };
                for (var i in subject_list) {
                    let now_subject = subject_list[i];
                    var data = worktable_content[now_subject["col_id"] + now_row.toString()].w;
                    if (!re_float.test(data)) {
                        add_log(`考生姓名${now_student.name}，考号${now_student.id}，科目${now_subject.subject_name}，成绩无效。原数据：${data}\n\n`, "del_line");
                        data = -1;
                    } else if (parseFloat(data) > now_subject.full_score) {
                        add_log(`考生姓名${now_student.name}，考号${now_student.id}，科目${now_subject.subject_name}，成绩无效。原数据：${data}\n\n`, "del_line");
                        data = -1
                    } else {
                        data = parseFloat(data);
                    }
                    score.push(data);
                }
                now_student.score = score;
                student_list.push(now_student);
            }
            all_data = {
                "name": data_src_name, "subject": subject_list, "student": student_list
            };
            add_log("生成完毕。", "del_line");
            console.log(all_data);
            file_name = `${all_data.name}.ervds`;
            var file = new File([JSON.stringify(all_data)], file_name);
            file_url = URL.createObjectURL(file);
            set_file_name(file_name)
            set_file_url(file_url);
            console.log(file_name);
            console.log(file_url);

        } catch (e) {
            console.log(e);
            notification_api["error"]({
                "message": "生成数据源时出错", "discription": e.toString()
            });
            add_log("生成数据源时出错。", "del_line");
        }
    }

    function get_subjects() {
        let subject_list = [];
        console.log(subject_data_source);
        for (var now_subject in subject_data_source) {
            console.log("subject_name_input_" + now_subject.toString());
            let subject_name = document.getElementById("subject_name_input_" + now_subject.toString()).value;
            let full_score = parseFloat(document.getElementById("full_score_input_" + now_subject.toString()).value);
            let is_counted = document.getElementById("is_counted_switch_" + now_subject.toString()).ariaChecked;
            let col_id = document.getElementById("col_id_input_" + now_subject.toString()).value.toUpperCase();
            subject_list.push({
                "subject_name": subject_name, "full_score": full_score, "is_counted": is_counted, "col_id": col_id
            });
            //console.log(document.getElementById("subject_name_input_" +now_subject.toString()).value);
        }
        console.log(subject_list);
        return subject_list;
    }

    function check_subjects(subject_list) {
        console.log(subject_list);
        if (subject_list.length === 0) {
            notification_api["error"]({
                "message": "科目列表无效", "description": "科目列表为空。"
            });
            return false;
        }
        for (var i in subject_list) {
            let now_subject_list = subject_list[i];
            console.log(now_subject_list);
            if (now_subject_list.subject_name === "" || now_subject_list.col_id === "") {
                notification_api["error"]({
                    "message": "科目列表无效", "description": "部分数据为空。"
                });
                return false;
            }
            if (!re_letter.test(now_subject_list.col_id)) {
                notification_api["error"]({
                    "message": "科目列表无效", "description": "列号数据无效。"
                });
                console.log(re_letter);
                console.log(now_subject_list.col_id);
                return false;
            }
            if (isNaN(now_subject_list.full_score)) {
                notification_api["error"]({
                    "message": "科目列表无效", "description": "满分数据无效。"
                });
                return false;
            }
            if (now_subject_list.full_score === 0) {
                notification_api["error"]({
                    "message": "科目列表无效", "description": "满分不能为0。"
                });
                return false;
            }
        }
        return true;
    }
}