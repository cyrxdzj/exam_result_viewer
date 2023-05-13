import {notification, Table} from "antd";
import React from "react";
import ReactDOM from 'react-dom/client';
import domtoimage from "dom-to-image"

const text_size = {
    "normal": "16px", "h4": "20px", "h3": "24px", "h2": "32px", "h1": "40px"
};

export function Background({children}) {
    return (<div style={{
        "background": "linear-gradient(to top, #000088 0%, #330867 100%)",
        "position": "fixed",
        "padding": "30px",
        "top": "0px",
        "bottom": "0px",
        "left": "0px",
        "right": "0px",
        "overflow": "auto"
    }}>{children}</div>);
}

export function Card(props) {
    return (<div style={{
        "background": "rgba(255,255,255,0.5)", "padding": "30px"
    }} {...props} className={"border_radius"}>{props.children}</div>);
}

export function Page({children}) {
    const thanks_table_data = [{
        "key": "antd", "name": "Ant Design", "usage": "页面组件设计，如按钮、输入框等。", "url": "https://ant.design"
    }, {
        "key": "lxgw",
        "name": <Text>霞鹜文楷</Text>,
        "usage": <Text>页面字体。</Text>,
        "url": "https://github.com/lxgw/LxgwWenKai"
    }];
    const columns = [{
        title: <Text bold={true}>名称</Text>,
        dataIndex: 'name',
        key: 'name',
        render: (_, record) => <Text>{record.name}</Text>,
    }, {
        title: <Text bold={true}>用途</Text>,
        dataIndex: 'usage',
        key: 'usgae',
        render: (_, record) => <Text>{record.usage}</Text>,
    }, {
        title: <Text bold={true}>URL</Text>,
        dataIndex: 'url',
        key: 'url',
        render: (_, record) => <a href={record.url} target={"_blank"} rel={"noreferrer"}><Text>{record.url}</Text></a>,
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
            <NextLine/>
            <center>
                <Text>Powered by <a href={"https://github.com/cyrxdzj/exam_result_viewer"} target={"_blank"}
                                    rel={"noreferrer"}>ExamResultViewer</a>, developed by <a
                    href={"https://space.bilibili.com/673922693?spm_id_from=333.1007.0.0"} target={"_blank"}
                    rel={"noreferrer"}>cyrxdzj</a>.</Text>
            </center>
        </Card>
    </Background>);
}

export function Text(props) {
    return (<span style={{
        "fontSize": text_size[props.type ? props.type : "normal"],
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

    const [notification_api, context_holder] = notification.useNotification();
    const table_column = [{
        "title": <Text>科目名称</Text>,
        "key": "name",
        "dataIndex": "name",
        render: (_, record) => (<Text>{record.name}</Text>)
    }, {
        "title": <Text>得分</Text>,
        "key": "score",
        "dataIndex": "score",
        render: (_, record) => (record.score === -1) ? (<Text>无效</Text>) : (
            <Text>{JSON.stringify(record.score)}</Text>)
    }, {
        "title": <Text>满分</Text>,
        "key": "full_score",
        "dataIndex": "full_score",
        render: (_, record) => (<Text>{JSON.stringify(record.full_score)}</Text>)
    }, {
        "title": <Text>数据内排名</Text>,
        "key": "rank",
        "dataIndex": "rank",
        render: (_, record) => (record.score === -1) ? (<Text>无效</Text>) : (
            <Text>{`${JSON.stringify(record.rank)}/${JSON.stringify(record.valid_cnt)}`}</Text>)
    }]
    const data_source = props.data.subject;
    return (<>
        {context_holder}
        <Card onDoubleClick={function (e) {
            console.log(e.target);
            if (e.target.className.indexOf("border_radius") === -1) {
                return;
            }
            notification_api["info"]({
                "message": "正在复制", "description": "正在尝试复制，这需要一点时间。",
            });
            setTimeout(function () {
                var div_for_image = document.createElement("div");
                div_for_image.style.width = div_for_image.style.height = "auto";
                div_for_image.style.padding = "30px";
                div_for_image.style.position = "fixed";
                div_for_image.style.background = "linear-gradient(to top, #000088 0%, #330867 100%)";
                div_for_image.style.borderRadius = "30px";
                div_for_image.style.zIndex = "-1000";
                div_for_image.appendChild(e.target.cloneNode(true));
                div_for_image.appendChild(document.createElement("br"));
                var footer = document.createElement("div");
                ReactDOM.createRoot(footer).render(<Card>
                    <center><Text>Powered by ExamResultViewer.</Text></center>
                    <NextLine size={"0px"}/>
                    <center><Text>Developed by cyrxdzj.</Text></center>
                </Card>);
                div_for_image.appendChild(footer);
                console.log("Append to body.");
                document.body.appendChild(div_for_image);
                domtoimage.toBlob(div_for_image, {bgcolor: "rgba(255,255,255,1)"}).then((blob) => {
                    document.body.removeChild(div_for_image);
                    console.log(blob);
                    navigator.clipboard.write([new window.ClipboardItem({
                        [blob.type]: blob,
                    })]).then(() => {
                        console.log("Copied.");
                        notification_api["success"]({
                            "message": "复制成功", "description": "复制成功。",
                        });
                    }, () => {
                        console.log("Copy error!");
                        notification_api["error"]({
                            "message": "复制失败", "description": "复制失败。",
                        })
                    })
                });
            }, 200);
        }}>
            <Text>{props.data.exam_name}</Text>
            <NextLine size={"0px"}/>
            <Text type={"h3"}>{props.data.name}</Text>
            <NextLine size={"0px"}/>
            <Text>考号：{props.data["id"]}</Text>
            <NextLine size={"0px"}/>
            <Text>班级：{props.data["class"]}</Text>
            <NextLine size={"0px"}/>
            <Table columns={table_column} dataSource={data_source} pagination={false} className={"table-row"}
                   size={"small"}/>
            {props.uncounted_subjects_dom}
        </Card>
    </>)
}