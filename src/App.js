import {Page, Card, NextLine, Text} from "./Components";
import {Button} from "antd";

export default function App() {
    return (
        <Page>
            <Card>
                <center><Text type={"h1"}>ExamResultViewer</Text></center>
                <center><Text>学业水平质量测试结果分析器</Text></center>
                <Text type={"h2"}>生成数据源文件</Text>
                <NextLine/>
                <Text>ExamResultViewer并不能智能地识别Excel中的内容，因此需要您先将Excel文件转换为数据源文件再进行分析。数据源文件包含了您的配置，这可以使您不必每次分析都要重新配置。</Text>
                <NextLine/>
                <Button type={"primary"} href={"/generate"}>开始生成</Button>
                <NextLine/>
                <Text type={"h2"}>分析数据源文件</Text>
                <NextLine/>
                <Text>配置好数据源文件后，您可以将其导入这里以进行分析。</Text>
                <NextLine/>
                <Button type={"primary"} href={"/analyze"}>开始分析</Button>
                <NextLine/>
            </Card>
        </Page>
    );
}
