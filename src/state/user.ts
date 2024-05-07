export type UserInfo = {
  userID: string;
  animalName: string;
  avatar: string;
  color: string;
};

export function randUserInfo(userID: string): UserInfo {
  const [avatar, name, color] =
    animalsWithColors[randInt(0, animalsWithColors.length - 1)];
  return {
    avatar,
    userID,
    animalName: name,
    color,
  };
}

const animalsWithColors = [
  ["🐶", "Puppy", "#f94144"],
  ["🐱", "Kitty", "#f3722c"],
  ["🐭", "Mouse", "#f8961e"],
  ["🐹", "Hamster", "#f9844a"],
  ["🐰", "Bunny", "#f9c74f"],
  ["🐼", "Panda", "#90be6d"],
  ["🐻", "Bear", "#43aa8b"],
  ["🐯", "Tiger", "#4d908e"],
  ["🦁", "Lion", "#577590"],
  ["🐸", "Frog", "#277da1"],
  ["🐨", "Koala", "#f94144"],
  ["🐵", "Monkey", "#f3722c"],
  ["🐢", "Turtle", "#f8961e"],
  ["🐙", "Octopus", "#f9844a"],
  ["🐳", "Whale", "#f9c74f"],
  ["🦄", "Unicorn", "#90be6d"],
  ["🐝", "Bee", "#43aa8b"],
  ["🐞", "Ladybug", "#4d908e"],
  ["🦋", "Butterfly", "#577590"],
  ["🐠", "Fish", "#277da1"],
  ["🐟", "Fish", "#f94144"],
  ["🐡", "Blowfish", "#f3722c"],
  ["🐬", "Dolphin", "#f8961e"],
  ["🦈", "Shark", "#f9844a"],
  ["🐊", "Crocodile", "#f9c74f"],
  ["🐅", "Tiger", "#90be6d"],
  ["🦍", "Gorilla", "#43aa8b"],
  ["🦓", "Zebra", "#4d908e"],
  ["🦒", "Giraffe", "#577590"],
  ["🦏", "Rhino", "#277da1"],
  ["🐘", "Elephant", "#f94144"],
  ["🦛", "Hippopotamus", "#f3722c"],
  ["🐪", "Camel", "#f8961e"],
  ["🐫", "Camel", "#f9844a"],
  ["🦙", "Llama", "#f9c74f"],
  ["🦘", "Kangaroo", "#90be6d"],
  ["🦥", "Sloth", "#43aa8b"],
  ["🦦", "Otter", "#4d908e"],
  ["🦨", "Skunk", "#577590"],
  ["🦡", "Badger", "#277da1"],
  ["🦔", "Hedgehog", "#f94144"],
  ["🦇", "Bat", "#f3722c"],
  ["🐓", "Rooster", "#f8961e"],
  ["🦃", "Turkey", "#f9844a"],
  ["🦢", "Swan", "#f9c74f"],
  ["🦜", "Parrot", "#90be6d"],
  ["🦩", "Flamingo", "#43aa8b"],
  ["🕊️", "Dove", "#4d908e"],
  ["🦚", "Peacock", "#577590"],
  ["🦉", "Owl", "#277da1"],
];

function randInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
