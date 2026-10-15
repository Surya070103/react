import { Typography, Button, Row, Col, Card } from "antd";

const { Title, Paragraph } = Typography;


function Home() {
    return (
        <div>
            <div style={{ textAlign: "center", padding: "40px 50px", background: "#f0f5ff" }}>

                <Paragraph style={{ fontsize: "18px", maxwidth: "600px", margin: "0 auto 20px" }}>
                    we build modern solutions that help buisness grow
                </Paragraph>
                <Button type="primary" size="large">Get Started</Button>
            </div>
            <div style={{ padding: "40px 20px" }}>
                <Title level={2}>About us</Title>
                <Paragraph>
                    nexbyte is dedicated to deliver high-quality technology solutions
                    to businesses of all sizes.
                </Paragraph>
            </div>
            <div style={{ padding: "40px 20px", background: "#fafafa" }}>
                <Title level={2}>Our Services</Title>
                <Row gutter={[15, 15]}>
                    <Col xs={24} md={8}>
                        <Card>

                            <Title level={3}>web technologies</Title>
                            <Paragraph>fast and scable web applications</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card>
                            <Title level={3}>Consulting</Title>
                            <Paragraph>Expert guidance to make the right decison</Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card>

                            <Title level={4}>Support</Title>
                            <Paragraph>relaiable ongoing support when u need it </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div style={{ textAlign: "center", padding: "40 px 20px" }}>
                <Title level={3}>ready to work</Title>
                <button type="primary" size="large">contact us</button>
            </div>
        </div>
    );
}

export default Home;