import {
  CallToAction,
  Code,
  Container,
  Content,
  Email,
  Footer,
  Header,
  Paragraph,
  Title,
} from '../templates';

function TestMail({ code, siteName, siteUrl }) {
  return (
    <Email>
      <Container>
        <Header logo="https://rake.red/rakered-black.png" />
      </Container>

      <Content>
        <Title>Complete Registration</Title>

        <Paragraph>
          Please copy this code to the verification page to verify your account.
        </Paragraph>

        <Code>{code}</Code>

        <Paragraph>
          Or if you're unable to use that code, click this button instead.
        </Paragraph>

        <CallToAction href="#">Confirm your email</CallToAction>

        <Paragraph>
          If you didn't create the account, please ignore this msg
        </Paragraph>
      </Content>

      <Footer>
        You have received this notification because
        <br />
        you have signed up for {siteName}
      </Footer>
    </Email>
  );
}

export default TestMail;
