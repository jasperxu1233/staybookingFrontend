import { Layout, Dropdown, Menu, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import LoginPage from "./Components/LoginPage";
import HostHomePage from "./Components/HostHomePage";
import GuestHomePage from "./Components/GuestHomePage";

const { Header, Content } = Layout;

class App extends React.Component {
    state = {              //用于记录了用户是否已经登录
      authed: false,   //存储登录状态
      asHost: false,   //存储是否是host
  };

  componentDidMount() {  //上树阶段就需要知道localstorage是否存了当前用户的，如果之前LocalStorage 里面已经存东西的话，表明已经登陆过，所以只要不点logout的话，token就不会被移除，会一致处于登录状态。
    const authToken = localStorage.getItem("authToken"); //localstorage相当于cookie，无论如何都不会消失（永久登录）
    const asHost = localStorage.getItem("asHost") === "true";
    this.setState({
      authed: authToken !== null,
      asHost,
    });
  }

  handleLoginSuccess = (token, asHost) => {  //登录成功的话，设置token
    localStorage.setItem("authToken", token);
    localStorage.setItem("asHost", asHost);
    this.setState({
      authed: true,
      asHost,
    });
  };

  handleLogOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("asHost");
    this.setState({
      authed: false,
    });
  };

  renderContent = () => {   //这里表示content，中层部分的显示，对未登录，已经登录是host，已经登陆不是host的进行页面反馈的选择。
    if (!this.state.authed) {
      return <LoginPage handleLoginSuccess={this.handleLoginSuccess} />;
    }

    if (this.state.asHost) {
      return <HostHomePage />;
    }

    return <GuestHomePage />;
  };

  userMenu = (  //如果在这里点击logout的话，就会触发handlLogOut function去进行token的移除。
      <Menu>
        <Menu.Item key="logout" onClick={this.handleLogOut}>
          Log Out
        </Menu.Item>
      </Menu>
  );

  render() {
    return (
        <Layout style={{ height: "100vh" }}>
          <Header style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "white" }}>
              Stays Booking
            </div>
            {this.state.authed && (  //如果处于登录状态的话，就要出现logout标志。
                <div>
                  <Dropdown trigger="click" overlay={this.userMenu}>
                    <Button icon={<UserOutlined />} shape="circle" />
                  </Dropdown>
                </div>
            )}
          </Header>
          <Content
              style={{ height: "calc(100% - 64px)", margin: 20, overflow: "auto" }}
          >
            {this.renderContent()}
          </Content>
        </Layout>
    );
  }
}

export default App;