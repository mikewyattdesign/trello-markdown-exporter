const fs = require('fs');
const path = require('path');

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloCard {
  idList: string;
  name: string;
  listName?: string;
  pos: number;
  closed: boolean;
}

interface TrelloBoard {
  lists: TrelloList[];
  cards: TrelloCard[];
}

interface TrelloColumnMap {
  [columnId: string]: string;
}

const file = process.argv.slice(2)[0];

// Load file
export const loadFile = (path: string) => {
  const fileData = fs.readFileSync(path);
  return JSON.parse(fileData);
}

// Get Column Names
export const getColumnNames = (board: TrelloBoard) => {
  return board.lists.reduce((carry: TrelloColumnMap, current) => {
    carry[current.id] = current.name;
    return carry;
  }, {});
}

// Map through Data Assigning Titles to Column Names
export const addTitlesToCards = (board: TrelloBoard): TrelloCard[] => {
  const columns = getColumnNames(board);

  return board.cards.map((card) => {
    return {
      name: card.name,
      idList: card.idList,
      listName: columns[card.idList],
      pos: card.pos,
      closed: card.closed
    }
  })
}

// Convert to Markdown
export const saveBoardAsMarkdown = (board: TrelloBoard): string => {
  const columns = getColumnNames(board);
  const activeCardsWithTitles = addTitlesToCards(board).filter((card) => card.closed == false);

  // Loop through Columns filtering cards and printing in order
  return Object.keys(columns).reduce((carry: string, current: string) => {
    carry += `## ${columns[current]}` + "\n";

    let cardsInList = activeCardsWithTitles.filter((card) => card.idList == current);
    cardsInList.sort((a, b) => {
      if (a.pos < b.pos) return -1;
      if (a.pos > b.pos) return 1;
      return 0;
    })
    carry += cardsInList.reduce((carry, current) => {
      carry += current.name + "  \n";
      return carry;
    }, "")
    carry += "\n";
    return carry;
  }, "")
}

const boardData = loadFile(file);
const markdownFileName = path.basename(file) + ".md";
fs.writeFile(markdownFileName, saveBoardAsMarkdown(boardData), function (err: any) {
  if (err) throw err;
  console.log(`Saved ${markdownFileName}`);
})