import {Card, NextLine, Page, Text} from "./Components";
import {Button, Form, Input, InputNumber, Popconfirm, Select, Space, Switch, Table} from "antd";
import React, {useContext, useEffect, useRef, useState} from "react";


// Start Copying
const EditableContext = React.createContext(null);
const EditableRow = ({index, ...props}) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};
const EditableCell = ({
                          title,
                          editable,
                          children,
                          dataIndex,
                          record,
                          handleSave,
                          ...restProps
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
                ...record,
                ...values,
            });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    let childNode = children;
    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save}/>
            </Form.Item>
        ) : (
            <div
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};
//End Copying
export default function DataSourceGenerator() {
    let [subject_data_source, set_subject_data_source] = useState([]);
    let [data_source_cnt, set_data_source_cnt] = useState(0);
    const default_columns = [
        {
            title: <Text bold={true}>科目名称</Text>,
            dataIndex: 'subject_name',
            key: 'subject_name',
        },
        {
            title: <Text bold={true}>满分</Text>,
            dataIndex: 'full_score',
            key: 'full_score',
        },
        {
            title: <Text bold={true}>是否计入总分</Text>,
            dataIndex: 'is_counted',
            key: 'is_counted'
        },
        {
            title: <Text bold={true}>操作</Text>,
            dataIndex: 'operation',
            key: 'operation',
            render: (_, record) =>
                subject_data_source.length >= 1 ? (
                    <Space>
                        <Button type={"text"} danger={true} onClick={() => delete_row(record.key)}>删除</Button>
                        <Button type={"text"}>上移</Button>
                        <Button type={"text"}>下移</Button>
                    </Space>
                ) : null,
        }
    ];

    //Start Copying
    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columns = default_columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: save_subject,
            }),
        };
    });
    //End Copying
    return (
        <Page>
            <Card>
                <center><Text type={"h1"}>ExamResultViewer - DataSourceGenerator</Text></center>
                <center><Text>学业水平质量测试结果分析器 - 数据源生成器</Text></center>
                <Text type={"h2"}>一、选择表格文件与工作表</Text>
                <NextLine/>
                <input type={"file"} id={"excel_file_input"}/>
                <NextLine/>
                <Input addonBefore={"工作表名"}/>
                <NextLine/>
                <Text type={"h2"}>二、选择数据行数范围</Text>
                <NextLine/>
                <Space>
                    <Text>从</Text>
                    <InputNumber addonBefore={<Text>第</Text>} addonAfter={<Text>行</Text>} step={1}/>
                    <Text>到</Text>
                    <InputNumber addonBefore={<Text>第</Text>} addonAfter={<Text>行</Text>} step={1}/>
                </Space>
                <NextLine/>
                <Text type={"h2"}>三、配置科目</Text>
                <NextLine/>
                <Table components={components} dataSource={subject_data_source} columns={columns} id={"subject_table"}/>
                <NextLine/>
                <Space>
                    <Button type={"primary"} onClick={function (){new_subject();}}>新增科目</Button>
                </Space>
            </Card>
        </Page>
    );

    function delete_row(key) {
        const new_data = subject_data_source.filter((item) => item.key !== key);
        console.log(subject_data_source.length, new_data.length);
        set_subject_data_source(new_data);
        console.log(new_data);
    }

    const save_subject = (row) => {
        const newData = [...subject_data_source];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        set_subject_data_source(newData);
        console.log("On save.");
    };

    function new_subject() {
        const new_data =
            {
                "subject_name": <Input id={"subject_name_input_" + data_source_cnt.toString()}/>,
                "full_score": <InputNumber id={"full_score_input_" + data_source_cnt.toString()}/>,
                "is_counted": <Switch id={"is_counted_switch_" + data_source_cnt.toString()} defaultChecked={true}/>,
                "operation":
                    null,
                "key": data_source_cnt
            };
        set_subject_data_source([...subject_data_source, new_data]);
        set_data_source_cnt(data_source_cnt + 1);
        subject_data_source=[...subject_data_source, new_data];
        data_source_cnt=data_source_cnt+1;
        //console.log(new_data);
    }

    function get_subjects() {
        let subject_list = [];
        for(const now_subject in subject_data_source)
        {
            subject_list.push(
                {
                    "subject_name":document.getElementById("subject_name_input_" +now_subject.toString()).value,
                    "full_score":document.getElementById("full_score_input_" +now_subject.toString()).value,
                    "is_counted":document.getElementById("is_counted_switch_" +now_subject.toString()).ariaChecked
                }
            )
            //console.log(document.getElementById("subject_name_input_" +now_subject.toString()).value);
        }
        console.log(subject_list);
        return subject_list;
    }
}
