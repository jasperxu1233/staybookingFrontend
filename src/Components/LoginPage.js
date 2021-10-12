import React from "react";
import { Form, Button, Input, Space, Checkbox, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { login, register } from "../utils";

class LoginPage extends React.Component {
    formRef = React.createRef(); // react提供的基于采集用户填写信息的function。
    state = {
        asHost: false,  //登录是否以host登录
        loading: false, //loading状态是否
    };

    onFinish = () => {  //form结束点击，执行。
        console.log("finish form");
    };

    handleLogin = async () => {
        const formInstance = this.formRef.current;  //没有使用到 antd自动通过onFinish拿到的数据可以直接作为参数传入

        try {
            await formInstance.validateFields();   //await，异步，function之前一定得加async才能做到异步，检查输入的信息是否是满足要求，不满足的话，直接return，满足了才会进行下一步的向服务器发送request，loading等。
        } catch (error) {
            return;
        }

        this.setState({ //点击登录的话，就会设置loading状态，让用户不可点击
            loading: true,
        });

        try {
            const { asHost } = this.state; //传递得到的state是否以host登录，然后发送给后端拿response
            const resp = await login(formInstance.getFieldsValue(true), asHost);
            this.props.handleLoginSuccess(resp.token, asHost);  //如果登录成功的话，就会调用父组件的handleLoginSuccess function然后传入相对应的参数。
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false, //加载结束设置loading状态为false
            });
        }
    };

    handleRegister = async () => {
        const formInstance = this.formRef.current;

        try {
            await formInstance.validateFields(); //查看拿到的用户填写的信息是否有效否则直接return
        } catch (error) {
            return;
        }

        this.setState({
            loading: true,
        });

        try {
            await register(formInstance.getFieldsValue(true), this.state.asHost);  //从后端拿到的用户信息，以及是否用host注册的。
            message.success("Register Successfully");
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    handleCheckboxOnChange = (e) => {   //点击了改变asHost状态，点的话就是true，不点的话就是false
        this.setState({
            asHost: e.target.checked,
        });
    };

    render() {
        return (        //ref得通过form里面的this.formRef联系起来才能存储用户填写的信息。  ref手动采集信息，没有使用到antd的onFinish来收集信息。
            <div style={{ width: 500, margin: "20px auto" }}>
                <Form ref={this.formRef} onFinish={this.onFinish}>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Username!",
                            },
                        ]}
                    >
                        <Input
                            disabled={this.state.loading}
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Password!",
                            },
                        ]}
                    >
                        <Input.Password
                            disabled={this.state.loading}
                            placeholder="Password"
                        />
                    </Form.Item>
                </Form>
                <Space>
                    <Checkbox
                        disabled={this.state.loading}  //
                        checked={this.state.asHost}  //通过点击是否ashost，来使组件rerender
                        onChange={this.handleCheckboxOnChange}
                    >
                        As Host
                    </Checkbox>
                    <Button
                        onClick={this.handleLogin}
                        disabled={this.state.loading}
                        shape="round"
                        type="primary"
                    >
                        Log in
                    </Button>
                    <Button
                        onClick={this.handleRegister}
                        disabled={this.state.loading}
                        shape="round"
                        type="primary"
                    >
                        Register
                    </Button>
                </Space>
            </div>
        );
    }
}

export default LoginPage;
