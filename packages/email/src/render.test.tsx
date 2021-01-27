import { render } from './render';
import TestMail from './test/TestMail';

test('can render email', () => {
  const html = render(
    <TestMail code={123456} siteName="Example" siteUrl="https://example.com" />,
  );

  expect(html).toContain('placeholder.com-logo4.png');
  expect(html).toContain('Go to Example');
  expect(html).toContain('Complete Registration');
  expect(html).toContain('Please copy this code');
  expect(html).toContain(123456);
  expect(html).toContain('click this button instead');
  expect(html).toContain('Confirm your email');
  expect(html).toContain(
    "If you didn't create the account, please ignore this msg",
  );

  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
  // expect(html).toContain('123456');
});
