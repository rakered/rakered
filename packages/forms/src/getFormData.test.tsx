import { getFormData, Event } from './getFormData';

async function submitForm(form): Promise<Event> {
  const div = document.createElement('div');
  div.innerHTML = `
    <form>
      ${form}
      <button type="submit">submit</button>
    </form>`;

  return new Promise((resolve) => {
    const form = div.querySelector('form');
    form?.addEventListener('submit', (event) => {
      resolve({
        preventDefault: event.preventDefault,
        currentTarget: event.target,
      });
    });

    form?.submit();
  });
}

test('correctly expands flattened names to object structures', async () => {
  const event = await submitForm(`
    <input name="first" value="first value" />
    <input name="second" value="second value" />
    
    <input name="obj.first" value="first nested value" />
    <input name="obj.second" value="second nested value" />
    
    <input name="arr[]" value="first" />
    <input name="arr[]" value="second" />
    
    <input name="idx[0]" value="zero" />
    <input name="idx[1]" value="one" />
  `);

  const data = getFormData(event);
  expect(data).toEqual({
    first: 'first value',
    second: 'second value',
    obj: {
      first: 'first nested value',
      second: 'second nested value',
    },
    arr: ['first', 'second'],
    idx: ['zero', 'one'],
  });
});

test('coerce types', async () => {
  const event = await submitForm(`
    <input type="datetime-local" name="date" value="2021-02-15T15:50:00" />
    <input type="checkbox" name="checkbox" checked="checked" />
    <input type="number" name="number" value="3" />
    <input type="password" name="password" value="hunter2" />
    <input type="radio" name="radio" value="on" checked />
    <input type="radio" name="radio" value="off" />
    <input type="range" name="range" value="4" />
    <input type="text" name="text" value="string" />
  `);

  const data = getFormData(event);

  expect(data.date).toBeInstanceOf(Date);
  expect(data.checkbox).toEqual(true);
  expect(data.number).toEqual(3);
  expect(data.password).toEqual({
    digest: 'f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7',
    algorithm: 'sha-256',
  });
  expect(data.radio).toEqual('on');
  expect(data.text).toEqual('string');
});
