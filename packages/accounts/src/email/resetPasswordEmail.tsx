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

export const getResetPasswordText = ({
  magicLink,
  siteName,
}: EmailOptions) => stripIndent`
Reset Your Password

Please use the link below to reset your password on ${siteName}.
 
If you did not request a password change, please ignore this message.

${magicLink}

---
You have received this notification because you have signed up for ${siteName}.
`;

export function ResetPasswordEmail({
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
        <Title>Reset Your Password</Title>

        <Paragraph>
          Please click on the button below to reset your password.
        </Paragraph>

        <CallToAction href={magicLink}>Reset password</CallToAction>

        <Paragraph>
          If you did not create this request, please ignore this message.
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

export function createResetPasswordEmail(options: EmailOptions) {
  const { to, from } = options;

  const text = getResetPasswordText(options);
  const html = render(<ResetPasswordEmail {...options} />);
  const subject = `${options.siteName} – reset your password`;

  return { to, from, subject, text, html };
}
