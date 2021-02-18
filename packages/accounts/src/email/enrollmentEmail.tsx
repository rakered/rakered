import {
  Email,
  Content,
  Header,
  Title,
  Paragraph,
  CallToAction,
  Container,
  Footer,
  render,
} from '@rakered/email';

import { stripIndent } from 'common-tags';

import { EmailOptions } from '../types';

export const getEnrollmentText = ({
  magicLink,
  siteName,
}: EmailOptions) => stripIndent`
Create Your Account

Please use the link below to create your account on ${siteName}.
 
If you did not expect to be invited, please ignore this message.

${magicLink}

---
You have received this notification because you have signed up for ${siteName}.
`;

export function EnrollmentEmail({
  siteName,
  logoUrl,
  magicLink,
}: EmailOptions) {
  return (
    <Email>
      <Container>
        <Header logo={logoUrl} />
      </Container>

      <Content>
        <Title>Create Your Account</Title>

        <Paragraph>
          Please click on the button below to create your account.
        </Paragraph>

        <CallToAction href={magicLink}>Create account</CallToAction>

        <Paragraph>
          If you did not expect to be invited, please ignore this message.
        </Paragraph>
      </Content>

      <Footer>
        You have received this notification because
        <br />
        you have signed up for {siteName}.
      </Footer>
    </Email>
  );
}

export function createEnrollmentEmail(options: EmailOptions) {
  const { to, from } = options;

  const text = getEnrollmentText(options);
  const html = render(<EnrollmentEmail {...options} />);
  const subject = `${options.siteName} – Create Your Account`;

  return { to, from, subject, text, html };
}
