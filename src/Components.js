import {Table} from "antd";

const text_size = {
    "normal": "16px",
    "h4": "20px",
    "h3": "24px",
    "h2": "32px",
    "h1": "40px"
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
        "background": "rgba(255,255,255,0.5)",
        "padding": "30px",
        "borderRadius": "30px"
    }}>{children}</div>);
}

export function Page({children}) {
    const thanks_table_data = [
        {
            "key": "antd",
            "name": <Text>Ant Design</Text>,
            "usage": <Text>页面组件设计，如按钮、输入框等。</Text>,
            "url": <a href={"https://ant.design"} target={"_blank"}><Text>https://ant.design</Text></a>
        },
        {
            "key": "lxgw",
            "name": <Text>霞鹜文楷</Text>,
            "usage": <Text>页面字体。</Text>,
            "url": <a href={"https://github.com/lxgw/LxgwWenKai"}
                      target={"_blank"}><Text>https://github.com/lxgw/LxgwWenKai</Text></a>
        }
    ];
    const columns = [
        {
            title: <Text bold={true}>名称</Text>,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: <Text bold={true}>用途</Text>,
            dataIndex: 'usage',
            key: 'usgae',
        },
        {
            title: <Text bold={true}>URL</Text>,
            dataIndex: 'url',
            key: 'url'
        }
    ];
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

export function Text({children, type = "normal", bold = false}) {
    return (<span style={{
        "fontSize": text_size[type],
        "fontFamily": "霞鹜文楷",
        "fontWeight": (type.startsWith("h") || bold) ? "bold" : "normal"
    }}>{children}</span>);
}

export function NextLine({size = "8px"}) {
    return (<div style={{"display": "block", "height": size}}/>);
}