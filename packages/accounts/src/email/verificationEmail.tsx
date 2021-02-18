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

export const getVerificationText = ({
  magicLink,
  siteName,
}: EmailOptions) => stripIndent`
Confirm Your Email

Please open the link below to confirm that you are the owner of this account.
 
If you did not create an account, please ignore this message.

${magicLink}

---
You have received this notification because you have signed up for ${siteName}.
`;

export function VerificationEmail({
  siteName,
  siteUrl,
  logoUrl,
  magicLink,
}: EmailOptions) {
  return (
    <Email>
      <Container>
        <Header logo={logoUrl} />
      </Container>

      <Content>
        <Title>Confirm Your Email</Title>

        <Paragraph>
          Please click on the button below to confirm that you are the owner of
          this account.
        </Paragraph>

        <CallToAction href={magicLink}>Confirm email</CallToAction>

        <Paragraph>
          If you did not create an account, please ignore this message.
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

export function createVerificationEmail(options: EmailOptions) {
  const { to, from } = options;

  const text = getVerificationText(options);
  const html = render(<VerificationEmail {...options} />);
  const subject = `${options.siteName} – Confirm Your Email`;

  return { to, from, subject, text, html };
}
