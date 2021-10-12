import React from "react";
import {Button, Card, Carousel, Image, List, Space, Tabs, Tooltip, message} from "antd";
import {deleteStay, getReservationsByStay, getStaysByHost} from "../utils";
import Text from "antd/es/typography/Text";
import {InfoCircleOutlined, LeftCircleFilled, RightCircleFilled} from "@ant-design/icons";
import Modal from "antd/es/modal/Modal";
import UploadStay from "./UploadStay";

const { TabPane } = Tabs;

class ReservationList extends React.Component {
    state = {
        loading: false,
        reservations: [],
    };

    componentDidMount() {
        this.loadData();  //组件上树
    }

    loadData = async () => {
        this.setState({  //先触发状态改变
            loading: true,
        });

        try {
            const resp = await getReservationsByStay(this.props.stayId); //拿到结果之后，才会进行28 29 行操作
            this.setState({
                reservations: resp,  //拿到json array的数据
            });
        } catch (error) {
            message.error(error.message);
        } finally {
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        const { loading, reservations } = this.state;

        return (
            <List
                loading={loading}
                dataSource={reservations}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<Text>Guest Name: {item.guest.username}</Text>} //将拿到的json array的数据，一个一个的以list item的形式放上面
                            description={
                                <>
                                    <Text>Checkin Date: {item.checkin_date}</Text>
                                    <br />
                                    <Text>Checkout Date: {item.checkout_date}</Text>
                                </>
                            }
                        />
                    </List.Item>
                )}
            />
        );
    }
}


class ViewReservationsButton extends React.Component {
    state = {
        modalVisible: false,
    };

    openModal = () => {
        this.setState({
            modalVisible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    render() {
        const { stay } = this.props;
        const { modalVisible } = this.state;

        const modalTitle = `Reservations of ${stay.name}`;  //string template

        return (  //点击onClick是的modal的状态为true，这样modal会出现
            <>
                <Button onClick={this.openModal} shape="round">
                    View Reservations
                </Button>
                {modalVisible && (  //modal出现之后，点击cancel，modal状态为false，这样modal就会消失。
                    <Modal
                        title={modalTitle}  //就是标题
                        centered={true}   //是否中心围绕
                        visible={modalVisible} //可见性
                        closable={true}  //右上角的 x
                        footer={null}   //有没有脚注
                        onCancel={this.handleCancel}  //点击事件
                        destroyOnClose={true}  //表示当这个modal没了的时候，下面那个 reservationlist组件也被销毁掉
                    >
                        <ReservationList stayId={stay.id} />
                    </Modal>
                )}
            </>
        );
    }
}


class RemoveStayButton extends React.Component {
    state = {
        loading : false,
    };

    handleRemoveStay = async () => {
        const { stay , onRemoveSuccess  } = this.props;

        this.setState ({
            loading : true
        })

        try {
            await deleteStay(stay.id);
            onRemoveSuccess();
        }catch(error) {
            message.error(error.message);
        }
            this.setState({
                loading : false
            })
    }

    render() {
        return (
            <Button
                loading = {this.state.loading}
                danger = {true}
                shape = "round"
                type = "primary"
                onClick = {this.handleRemoveStay} //按下按钮，触发删除，然后删除会触发父组件的重新loadData
            >
                Remove Stay
            </Button>
        )
    }
}


//js的一个js文件相当于一个package，可以放多个class的，class组件
export class StayDetailInfoButton extends React.Component {  //这个class组件用来添加每个card的detail信息，并且控制card的detail信息的开关
    state = {
        modalVisible: false,
    };

    openModal = () => {
        this.setState({
            modalVisible: true,
        });
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    render() {
        const { stay } = this.props;
        const { name, description, address, guest_number } = stay;
        const { modalVisible } = this.state;
        return (
            <>
                <Tooltip title="View Stay Details">
                    <Button
                        onClick={this.openModal}
                        style={{ border: "none" }}
                        size="large"
                        icon={<InfoCircleOutlined />}
                    />
                </Tooltip>
                {modalVisible && ( //modalVisible 决定了弹窗是否弹出
                    <Modal
                        title={name}
                        centered={true}   //表示是否被包围
                        visible={modalVisible}  //可见性
                        closable={true}  //是否右上角的 x 关闭
                        footer={null}
                        onCancel={this.handleCancel}  //被点的时候关闭，外面被点或者x被点   ， space可以给留出空间 ， strong就是字体的大小写
                    >
                        <Space direction="vertical">
                            <Text strong={true}>Description</Text>
                            <Text type="secondary">{description}</Text>
                            <Text strong={true}>Address</Text>
                            <Text type="secondary">{address}</Text>
                            <Text strong={true}>Guest Number</Text>
                            <Text type="secondary">{guest_number}</Text>
                        </Space>
                    </Modal>
                )}
            </>
        );
    }
}


class MyStays extends React.Component {  //用来显示每个stay，每个stay由card组成，一个card包含上面一个div标签里面由title和tooltip，tooltip里面包含modal。card的下半部分包含旋转木马，滑动显示一个stay的多张图片，还可以多图片进行放大缩小操作。
    state = {
        loading: false,
        data: [],
    };

    componentDidMount() {  //只能一开始拿数据
        this.loadData();
    }

    loadData = async() => {
        this.setState({
            loading : true,
        })

        try {
            const resp = await getStaysByHost();
            this.setState({
                data: resp,
            });
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
        <List
            loading={this.state.loading}
            grid={{            //表示大页面，小页面一行放多少张图片
                  gutter: 16,
                  xs: 1,
                  sm: 3,
                  md: 3,
                  lg: 3,   //中图一行放几张
                  xl: 4,  //大图一行放几张
                  xxl: 4,  //超大图一行放几张
              }}
            dataSource={this.state.data}
            renderItem={(item) => (  //数组里面的元素会一个一个放入
                <List.Item>
                    <Card    //card是一个一个的小块
                        key={item.id}
                        title={         //当名字超过150时，会自动使用...省略号
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Text ellipsis={true} style={{ maxWidth: 150 }}>
                                    {item.name}
                                </Text>
                                <StayDetailInfoButton stay={item} />
                            </div>
                        }
                        actions={[<ViewReservationsButton stay={item} />]}  // 规定了位置放在下边
                        extra={<RemoveStayButton stay = {item}  onRemoveSuccess = {this.loadData}/>}  //将整个stay的信息传给remove stay button ， 规定了位置放在右上角
                    >
                        {                               //下面的放stay的图片，旋转木马样式
                            <Carousel
                                dots={false}  //必须加dots和arrows
                                arrows={true}
                                prevArrow={<LeftCircleFilled />}  //向左向右划的箭头
                                nextArrow={<RightCircleFilled />}
                            >
                                {item.images.map((image, index) => (  //旋转木马里面显示的图片的张数， 并且 <Image> 做了一个图片的缩小放大
                                    <div key={index}>
                                        <Image src={image.url} width="100%" />
                                    </div>
                                ))}
                            </Carousel>
                        }
                    </Card>
                </List.Item>
            )}
        />
      )
    }
}

class HostHomePage extends React.Component {
    render() {
        return (       //选择哪个键，并且将不活跃的tabpane里面的内容直接没了
            <Tabs defaultActiveKey="1" destroyInactiveTabPane={true}>
                <TabPane tab="My Stays" key="1">
                    <MyStays />
                </TabPane>
                <TabPane tab="Upload Stay" key="2">
                    <UploadStay />
                </TabPane>
            </Tabs>
        );
    }
}

export default HostHomePage;