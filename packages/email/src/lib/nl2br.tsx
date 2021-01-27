const regEx = /(\r\n|\n\r|\r|\n)/g;

export function nl2br(str) {
  return `${str}`.split(regEx).map((line, index) => {
    if (line.match(regEx)) {
      return <br key={index} />;
    }

    return line;
  });
}
