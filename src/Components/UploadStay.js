import React from "react";
import { Form, Input, InputNumber, Button, message } from "antd";
import { uploadStay } from "../utils";

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

class UploadStay extends React.Component {
    state = {
        loading: false,
    };

    fileInputRef = React.createRef();  //使用React.createRef()来放置一个类似水桶，接数据，这里放img类型的数据
                 //values 和 fileInputRef 和 下面 ref的关系？？？
    handleSubmit = async (values) => {  //传入的values参数是lib，直接拿到的从表格中填的元素 。 antd自动通过onFinish拿到的数据可以直接作为参数传入
        const formData = new FormData();  //因为后端需要拿到formData的格式的数据，固定写法
        const { files } = this.fileInputRef.current;  //将拿到的image数据解构给files

        if (files.length > 5) {
            message.error("You can at most upload 5 pictures.");
            return;
        }

        for (let i = 0; i < files.length; i++) {
            formData.append("images", files[i]);  //将 存放在files里面的数据存在formData obj里面，因为后端需要formData格式的数据
        }

        formData.append("name", values.name);
        formData.append("address", values.address);
        formData.append("description", values.description);
        formData.append("guest_number", values.guest_number);

        this.setState({
            loading: true,
        });
        try {
            await uploadStay(formData);
            message.success("upload successfully");
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        return (
            <Form
                {...layout}  //...layout表示 将数据传入
                name="nest-messages"
                onFinish={this.handleSubmit}
                style={{ maxWidth: 1000, margin: "auto" }}
            >
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="address" label="Address" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"  label="Description" rules={[{ required: true }]}  //name指 这个item的名字， label指显示ui的内容
                >
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
                </Form.Item>
                <Form.Item
                    name="guest_number" label="Guest Number" rules={[{ required: true, type: "number", min: 1 }]}
                >
                    <InputNumber />
                </Form.Item>

                <Form.Item name="picture" label="Picture" rules={[{ required: true }]}>
                    <input
                        type="file"
                        accept="image/png, image/jpeg"  //限定格式
                        ref={this.fileInputRef}  //ref手动拿到了数据，随后传给了fileInputRef
                        multiple={true} //表示可以多个图片
                    />
                </Form.Item>

                <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={this.state.loading}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default UploadStay;