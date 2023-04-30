import {Table} from "antd";
import React from "react";

const text_size = {
    "normal": "16px", "h4": "20px", "h3": "24px", "h2": "32px", "h1": "40px"
};

export function Background({children}) {
    return (<div style={{
        "background": "linear-gradient(#0ba360 0%, #3cba92 100%)",
        "position": "fixed",
        "padding": "30px",
        "top": "0px",
        "bottom": "0px",
        "left": "0px",
        "right": "0px",
        "overflow": "auto"
    }}>{children}</div>);
}

export function Card({children}) {
    return (<div style={{
        "background": "rgba(255,255,255,0.5)", "padding": "30px", "borderRadius": "30px"
    }}>{children}</div>);
}

export function Page({children}) {
    const thanks_table_data = [{
        "key": "antd",
        "name": <Text>Ant Design</Text>,
        "usage": <Text>页面组件设计，如按钮、输入框等。</Text>,
        "url": <a href={"https://ant.design"} target={"_blank"}
                  rel={"noreferrer"}><Text>https://ant.design</Text></a>
    }, {
        "key": "lxgw",
        "name": <Text>霞鹜文楷</Text>,
        "usage": <Text>页面字体。</Text>,
        "url": <a href={"https://github.com/lxgw/LxgwWenKai"}
                  target={"_blank"} rel={"noreferrer"}><Text>https://github.com/lxgw/LxgwWenKai</Text></a>
    }];
    const columns = [{
        title: <Text bold={true}>名称</Text>, dataIndex: 'name', key: 'name',
    }, {
        title: <Text bold={true}>用途</Text>, dataIndex: 'usage', key: 'usgae',
    }, {
        title: <Text bold={true}>URL</Text>, dataIndex: 'url', key: 'url'
    }];
    return (<Background>
        {children}
        <NextLine size={"30px"}/>
        <Card>
            <Text>ExamResultViewer确保所有数据本地分析，不会上传至服务器。</Text>
            <NextLine/>
            <Text>以下是ExamResultViewer所使用的部分开源软件，在此表示感谢。</Text>
            <NextLine/>
            <Table dataSource={thanks_table_data} columns={columns} pagination={false}/>
        </Card>
    </Background>);
}

export function Text(props) {
    return (<span style={{
        "fontSize": text_size[props.type],
        "fontFamily": "霞鹜文楷",
        "fontWeight": ((props.type !== undefined && props.type.startsWith("h")) || props.bold) ? "bold" : "normal",
    }} {...props}>{props.children}</span>);
}

export function NextLine({size = "8px"}) {
    return (<div style={{"display": "block", "height": size}}/>);
}

export function PersonalResult(props) {
    /*var test_data = {
        "name": "Deng Zijun",
        "id": "0118030007",
        "class": "7",
        "subject": [
            {
                "name": "语文",
                "score": 105,
                "full_score": 120,
                "rank": 1,
                "valid_cnt": 7,
            }
        ]
    }*/
    const table_column = [
        {
            "title": <Text>科目名称</Text>,
            "key": "name",
            "dataIndex": "name",
            render: (_, record) => (<Text>{record.name}</Text>)
        },
        {
            "title": <Text>得分</Text>,
            "key": "score",
            "dataIndex": "score",
            render: (_, record) => (record.score === -1) ? (<Text>无效</Text>) : (
                <Text>{JSON.stringify(record.score)}</Text>)
        },
        {
            "title": <Text>满分</Text>,
            "key": "full_score",
            "dataIndex": "full_score",
            render: (_, record) => (<Text>{JSON.stringify(record.full_score)}</Text>)
        },
        {
            "title": <Text>数据内排名</Text>,
            "key": "rank",
            "dataIndex": "rank",
            render: (_, record) => (record.score === -1) ? (<Text>无效</Text>) : (
                <Text>{`${JSON.stringify(record.rank)}/${JSON.stringify(record.valid_cnt)}`}</Text>)
        }
    ]
    const data_source = props.data.subject;
    return (
        <Card>
            <Text type={"h3"}>{props.data.name}</Text>
            <NextLine size={"0px"}/>
            <Text>考号：{props.data["id"]}</Text>
            <NextLine size={"0px"}/>
            <Text>班级：{props.data["class"]}</Text>
            <NextLine size={"0px"}/>
            <Table columns={table_column} dataSource={data_source} pagination={false} className={"table-row"}
                   size={"small"}/>
        </Card>
    )
}