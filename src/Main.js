import React, { useRef, useState, useEffect } from "react";
// eslint-disable-next-line
import { GameBackend, getScreen, sleep, randInt, clearScreen, print }
       from "./components/GameBackend";

// Your code here!
const game = async (screen, refresh, keyPress, exit) => {
  // Global game variables.
  let score = 0;
  let hiscore = 0;
  const shooter = {};
  const spaceships = new Array(3);
  const asteroids = new Array(5);

  const initGame = async () => {
    shooter.x = 18;
    for (let i = 0; i < spaceships.length; i++) {
      spaceships[i] = {x: randInt(0, 36), y: randInt(-10, 0)}
    }
    for (let i = 0; i < asteroids.length; i++) {
      asteroids[i] = {x: randInt(0, 40), y: randInt(-23, 0)}
    }

    clearScreen(screen);
    print(screen, 2, 0, "SCORE:" + score.toString().padStart(6, "0"));
    print(screen, 23, 0, "HI-SCORE:" + hiscore.toString().padStart(6, "0"));
    print(screen, 0, 23, " ".repeat(40), "white", "white");
    for (let y = 21; y > 18; y--) {
      print(screen, shooter.x+1, y, " ", "white", "blue");
    }
    print(screen, shooter.x-7, 19, " BEAM[Z]");
    print(screen, shooter.x-5, 22,   "[J]<=┏┻┓=>[L]");
    print(screen, 12, 10, "HIT [S] TO START");
    refresh();
    while (true) {
      if (exit.current) return;
      if (keyPress["s"]) break;
      await sleep(100);
    }
    clearScreen(screen);
    score = 0;
    print(screen, 0, 23, " ".repeat(40), "white", "white");
  }

  const shooterMove = async () => {
    let x = shooter.x;
    let y = 22;
    if (keyPress["z"]) {
      score = Math.max(0, score - 10);
      for (let yy = y-1; yy > 0; yy--) {
        print(screen, x+1, yy, " ", "white", "blue");
        await refresh();
      }
      await sleep(100);
      for (let yy = y-1; yy > 0; yy--) {
        print(screen, x+1, yy, " ");
        await refresh();
      }
      for (let i = 0; i < spaceships.length; i++) {
        let xx = spaceships[i].x;
        let yy = spaceships[i].y;
        if (yy > 0 && x+1 === xx+2) {
          score += 100;
          if (score > hiscore) hiscore = score;
          print(screen, xx, yy, "※※※※※", "blue", "red");
          await refresh();
          await sleep(500);
          print(screen, xx, yy, "     ");
          spaceships[i] = {x: randInt(0, 36), y: randInt(-10, 1)};
        }
      }
    }

    print(screen, x, y, "   ");
    if ( keyPress["l"]) {
      if ( x < 37 && screen[y+1][x+3].bgColor === "white") {
        x += 1;
      }
    }
    if ( keyPress["j"] ) {
      if ( x > 0 && screen[y+1][x-1].bgColor === "white") {
        x -= 1;
      }
    }
    print(screen, x, y, "┏┻┓");
    shooter.x = x;
  }

  const asteroidsMove = async () => {
    for (let i = 0; i < asteroids.length; i++) {
      let x = asteroids[i].x;
      let y = asteroids[i].y;
      print(screen, x, y, " ");
      y += 1;
      if ( y === 23 ) y = randInt(-10, 1);
      x += randInt(-1, 2);
      if ( x < 0 ) x = 39;
      if ( x > 39 ) x = 0;
      if ( y > 0 ) print(screen, x, y, "*");
      if ( y === 22 ) {
        if ( x >= shooter.x && x <= shooter.x+2 ){
          finished = true;
        }
      }
      asteroids[i].x = x;
      asteroids[i].y = y;
    }
  }

  const spaceshipsMove = async () => {
    for (let i = 0; i < spaceships.length; i++) {
      let x = spaceships[i].x;
      let y = spaceships[i].y;
      print(screen, x, y, "     ");
      if (randInt(0, 5) === 0) y += 1;
      x += randInt(-1, 2);
      if ( x < 0 ) x = 0;
      if ( x > 35 ) x = 35;
      if ( y > 0 ) print(screen, x, y, "(=@=)");
      spaceships[i].x = x;
      spaceships[i].y = y;
      if ( y === 22 ) {
        print(screen, x, y, "wwwww", "black", "red");
        print(screen, x, y+1, "     ", "white", "red");
        for (let yy = y-1; yy > 0; yy--) {
          print(screen, x, yy, "     ", "white", "red");
          await refresh();
        }
        await sleep(500);
        for (let yy = y+1; yy > 0; yy--) {
          print(screen, x, yy, "     ");
          await refresh();
        }
        if ( x + 4 >= shooter.x && x <= shooter.x + 2 ) {
          finished = true;
        }
        spaceships[i] = {x: randInt(0, 36), y: 1}
      }
    }
  }

  // main loop
  var finished;
  while (true) {
    finished = false;
    await initGame();
    while (!finished) {
      if (exit.current) return;
      await shooterMove();
      await asteroidsMove();
      await spaceshipsMove();
      print(screen, 0, 0, " ".repeat(40));
      print(screen, 2, 0, "SCORE:" + score.toString().padStart(6, "0"));
      print(screen, 23, 0, "HI-SCORE:" + hiscore.toString().padStart(6, "0"));
      await refresh();
      await sleep(100);
    }
    print(screen, shooter.x, 22, "WWW", "black", "red");
    print(screen, 15, 10, " GAME OVER ", "black", "white");
    await refresh();
    await sleep(5000);
  }
}


export const Main = (props) => {
  // Define keys used in the game.
  const keys = ["s", "z", "j", "l"];

  // The following part is a fixed boilarplate. Just leave as is.
  const xSize = 40;
  const ySize = 24;
  const screenRef = useRef(getScreen(xSize, ySize));
  const screen = screenRef.current;
  const exit = useRef(false);
  const keyPressRef = useRef({});
  const keyPress = keyPressRef.current;
  // eslint-disable-next-line
  const [dummyState, setDummyState] = useState([]);
  const refresh = () => { setDummyState([]); }

  useEffect(
    () => {
      game(screen, refresh, keyPress, exit);
      return () => exit.current = true;
    }, [screen, keyPress]
  );

  const element = (
    <GameBackend keys={keys} keyPress={keyPress} screen={screen}/>
  );

  return element;
}
