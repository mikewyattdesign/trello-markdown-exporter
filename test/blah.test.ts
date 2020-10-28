import { getColumnNames } from '../src';

describe('exporter', () => {
  it('gets column names', () => {
    expect(getColumnNames({
      lists: [{ id: "1", name: "One" }],
      cards: []
    })).toEqual({
      "1":
        "One"
    });
  });
});
