class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");

    this.personaje = null;
    this.enemigos1 = [];
    this.enemigos2 = [];

    this.puntuacion = 10;
    this.gameIntervals = [];
    this.gameOver = false;
    this.gameStarted = false;

    this.bgMusic = new Audio("Sonidos/As-far-as-the-eye.mp3");
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.5;

    this.mostrarInstrucciones();
  }

  mostrarInstrucciones() {
    const instructionsBox = document.createElement("div");
    instructionsBox.id = "instructionsBox";
    instructionsBox.style.position = "absolute";
    instructionsBox.style.top = "50%";
    instructionsBox.style.left = "50%";
    instructionsBox.style.transform = "translate(-50%, -50%)";
    instructionsBox.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    instructionsBox.style.color = "#FFD700";
    instructionsBox.style.fontFamily = "'Cinzel', serif";
    instructionsBox.style.padding = "20px 40px 25px";
    instructionsBox.style.borderRadius = "15px";
    instructionsBox.style.textAlign = "center";
    instructionsBox.style.width = "calc(100% - 200px)";
    instructionsBox.style.maxWidth = "1000px";
    instructionsBox.style.height = "auto";
    instructionsBox.style.maxHeight = "calc(100vh - 40px)";
    instructionsBox.style.overflowY = "auto";
    instructionsBox.style.zIndex = "200";
    instructionsBox.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    instructionsBox.style.boxSizing = "border-box";

    let instructionsHTML = `
      <h2 style="font-size: 2.7em; margin-bottom: 15px;">La Esencia del Mago</h2>
      <p style="font-size: 1.1em; line-height: 1.5;">
        Eres un mago encogido que debe restaurar su poder y tamaño.
      </p>
      <p style="font-size: 1.1em; line-height: 1.5; margin-bottom: 20px;">
        Recolecta los **Orbes Voladores** (los pequeños) para recuperar tu energía y crecer.
        ¡Cada orbe te da **3 puntos**!
      </p>
      <p style="font-size: 1.1em; line-height: 1.5; margin-bottom: 20px;">
        ¡Cuidado con los **Jabalíes Furiosos**! Si te tocan, perderás energía.
        ¡Cada golpe de jabalí te resta **6 puntos**!
      </p>
      <p style="font-size: 1.1em; line-height: 1.5;">
        Tu misión es alcanzar los **100 puntos** para recuperar tu tamaño original.
        Si tu energía llega a **0**, el juego termina.
      </p>
      <p style="font-size: 1.3em; font-weight: bold; margin-top: 25px;">
        Controles:
      </p>
      <p style="font-size: 1.1em;">
        **Flechas Izquierda/Derecha:** Moverse
      </p>
      <p style="font-size: 1.1em; margin-bottom: 20px;"> **Espacio:** Saltar (doble salto posible)
      </p>
    `;

    instructionsBox.innerHTML = instructionsHTML;

    const startButton = document.createElement("button");
    startButton.textContent = "¡Empezar Aventura!";
    startButton.style.marginTop = "20px";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "24px";
    startButton.style.fontWeight = "bold";
    startButton.style.backgroundColor = "#4CAF50";
    startButton.style.color = "white";
    startButton.style.border = "2px solid #388E3C";
    startButton.style.borderRadius = "8px";
    startButton.style.cursor = "pointer";
    startButton.style.fontFamily = "'Cinzel', serif";
    startButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    startButton.style.transition = "background-color 0.3s ease";

    startButton.onmouseover = () => { startButton.style.backgroundColor = "#5cb85c"; };
    startButton.onmouseout = () => { startButton.style.backgroundColor = "#4CAF50"; };

    startButton.addEventListener("click", () => {
      this.container.removeChild(instructionsBox);
      this.iniciarJuego();
    });

    this.container.appendChild(instructionsBox);
    instructionsBox.appendChild(startButton);
  }

  iniciarJuego() {
    this.gameStarted = true;
    this.puntuacion = 10;
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    this.crearEscenario();
    this.agregarEventos();
    this.generarEnemigos1Continuamente();
    this.generarEnemigos2Continuamente();

    if (this.personaje) {
        this.personaje.loop();
    }

    this.bgMusic.play().then(() => {
        console.log("Música de fondo iniciada correctamente.");
    }).catch(error => {
        console.error("Error al iniciar la música de fondo:", error);
    });
  }

  crearEscenario() {
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.container.appendChild(this.personaje.element);

    for (let i = 0; i < 2; i++) {
      const enemigo2 = new Enemigo2();
      this.enemigos2.push(enemigo2);
      this.container.appendChild(enemigo2.element);
      enemigo2.loop();
    }
  }

  agregarEventos() {
    window.addEventListener("keydown", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.mover(e);
    });
    window.addEventListener("keyup", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.finMover(e);
    });
    this.checkColisiones();
    this.loop();
  }

  loop() {
    const loopId = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        this.enemigos1.forEach((enemigo) => enemigo.perseguir(this.personaje.x));
      }
    }, 50);
    this.gameIntervals.push(loopId);
  }

  checkColisiones() {
    const checkColisionesId = setInterval(() => {
      if (this.gameOver || !this.gameStarted) return;

      this.enemigos1 = this.enemigos1.filter((enemigo) => {
        if (this.personaje.colisionaCon(enemigo)) {
          if (this.container.contains(enemigo.element)) {
            this.container.removeChild(enemigo.element);
          }
          this.actualizarPuntuacion(-6);
          return false;
        }
        return true;
      });

      this.enemigos2 = this.enemigos2.filter((enemigo2) => {
        if (this.personaje.colisionaCon(enemigo2)) {
          if (this.container.contains(enemigo2.element)) {
            this.container.removeChild(enemigo2.element);
          }
          this.actualizarPuntuacion(3);
          return false;
        }
        return true;
      });
    }, 100);
    this.gameIntervals.push(checkColisionesId);
  }

  generarEnemigos1Continuamente() {
    const genEnemigo1Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        const enemigo = new Enemigo();
        this.enemigos1.push(enemigo);
        this.container.appendChild(enemigo.element);
      }
    }, 4000);
    this.gameIntervals.push(genEnemigo1Id);
  }

  generarEnemigos2Continuamente() {
    const genEnemigo2Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        const enemigo2 = new Enemigo2();
        this.enemigos2.push(enemigo2);
        this.container.appendChild(enemigo2.element);
        enemigo2.loop();
      }
    }, 1500);
    this.gameIntervals.push(genEnemigo2Id);
  }

  actualizarPuntuacion(puntos) {
    if (this.gameOver || !this.gameStarted) return;

    this.puntuacion += puntos;
    this.puntuacion = Math.max(0, this.puntuacion);
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    console.log("Puntos actuales:", this.puntuacion);

    if (this.puntuacion >= 100) {
        this.ganarJuego();
    } else if (this.puntuacion <= 0) {
        this.finDelJuego();
    }
  }

  ganarJuego() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.gameStarted = false;

      console.log("¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.");

      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;

      this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
      this.gameIntervals = [];

      if (this.personaje && this.personaje.element) {
          this.personaje.stopMoving();
          this.personaje.aumentarTamano(50);
      }

      [...this.enemigos1].forEach(enemigo => {
          if (enemigo.element && this.container.contains(enemigo.element)) {
             this.container.removeChild(enemigo.element);
          }
      });
      this.enemigos1 = [];
      [...this.enemigos2].forEach(enemigo => {
          if (enemigo.element && this.container.contains(enemigo.element)) {
              this.container.removeChild(enemigo.element);
          }
      });
      this.enemigos2 = [];

      const winMessage = document.createElement("div");
      winMessage.textContent = "¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.";
      winMessage.id = "winMessage";
      winMessage.style.position = "absolute";
      winMessage.style.fontSize = "2.5em";
      winMessage.style.fontWeight = "bold";
      winMessage.style.color = "#00FFff";
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
      winMessage.style.fontFamily = "'Cinzel', serif";
      winMessage.style.padding = "40px";
      winMessage.style.borderRadius = "15px";
      winMessage.style.textAlign = "center";
      winMessage.style.width = "80%";
      winMessage.style.maxWidth = "800px";
      winMessage.style.top = "40%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.zIndex = "100";
      winMessage.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
      winMessage.style.boxSizing = "border-box";

      this.container.appendChild(winMessage);

      const restartButton = document.createElement("button");
      restartButton.textContent = "Jugar de Nuevo";
      restartButton.id = "restartButtonWin";
      restartButton.style.position = "absolute";
      restartButton.style.top = "60%";
      restartButton.style.left = "50%";
      restartButton.style.transform = "translate(-50%, -50%)";
      restartButton.style.zIndex = "101";
      restartButton.style.padding = "15px 30px";
      restartButton.style.fontSize = "24px";
      restartButton.style.fontWeight = "bold";
      restartButton.style.backgroundColor = "#4CAF50";
      restartButton.style.color = "white";
      restartButton.style.border = "2px solid #388E3C";
      restartButton.style.borderRadius = "8px";
      restartButton.style.cursor = "pointer";
      restartButton.style.fontFamily = "'Cinzel', serif";
      restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      restartButton.style.transition = "background-color 0.3s ease";

      restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
      restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };

      restartButton.addEventListener("click", () => {
          location.reload();
      });

      this.container.appendChild(restartButton);
      console.log("Mensaje de victoria y botón de Reinicio añadidos.");
  }

  finDelJuego() {
    console.log("¡Se ha llamado a finDelJuego! GAME OVER.");
    this.gameOver = true;
    this.gameStarted = false;

    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;

    this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
    this.gameIntervals = [];

    if (this.personaje && this.personaje.element) {
        this.personaje.element.style.display = "none";
        this.personaje.stopMoving();
    }

    [...this.enemigos1].forEach(enemigo => {
        if (enemigo.element && this.container.contains(enemigo.element)) {
             this.container.removeChild(enemigo.element);
        }
    });
    this.enemigos1 = [];

    [...this.enemigos2].forEach(enemigo => {
        if (enemigo.element && this.container.contains(enemigo.element)) {
            this.container.removeChild(enemigo.element);
        }
    });
    this.enemigos2 = [];

    const gameOverMessage = document.createElement("div");
    gameOverMessage.textContent = "GAME OVER";
    gameOverMessage.id = "gameOverMessage";
    gameOverMessage.style.position = "absolute";
    gameOverMessage.style.fontSize = "60px";
    gameOverMessage.style.fontWeight = "bold";
    gameOverMessage.style.color = "#FFD700";
    gameOverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    gameOverMessage.style.fontFamily = "'Cinzel', serif";
    gameOverMessage.style.padding = "20px 40px";
    gameOverMessage.style.borderRadius = "10px";
    gameOverMessage.style.textAlign = "center";
    gameOverMessage.style.width = "auto";
    gameOverMessage.style.whiteSpace = "nowrap";
    gameOverMessage.style.top = "40%";
    gameOverMessage.style.left = "50%";
    gameOverMessage.style.transform = "translate(-50%, -50%)";
    gameOverMessage.style.zIndex = "100";
    gameOverMessage.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    gameOverMessage.style.boxSizing = "border-box";

    this.container.appendChild(gameOverMessage);
    console.log("Mensaje de Game Over añadido al DOM.");

    const restartButton = document.createElement("button");
    restartButton.textContent = "Reiniciar Juego";
    restartButton.id = "restartButton";
    restartButton.style.position = "absolute";
    restartButton.style.top = "60%";
    restartButton.style.left = "50%";
    restartButton.style.transform = "translate(-50%, -50%)";
    restartButton.style.zIndex = "101";
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "24px";
    restartButton.style.fontWeight = "bold";
    restartButton.style.backgroundColor = "#4CAF50";
    restartButton.style.color = "white";
    restartButton.style.border = "2px solid #388E3C";
    restartButton.style.borderRadius = "8px";
    restartButton.style.cursor = "pointer";
    restartButton.style.fontFamily = "'Cinzel', serif";
    restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    restartButton.style.transition = "background-color 0.3s ease";

    restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
    restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };

    restartButton.addEventListener("click", () => {
        console.log("Botón Reiniciar clicado. Recargando la página.");
        location.reload();
    });

    this.container.appendChild(restartButton);
    console.log("Botón de Reinicio añadido al DOM.");
  }
}

class Personaje {
  constructor() {
    this.x = 50;
    this.y = 0;
    this.width = 64;
    this.height = 100;
    this.velocidad = 10;

    this.rightPressed = false;
    this.leftPressed = false;
    this.spacePressed = false;

    this.jumpCount = 0;
    this.saltoSimple = 100;
    this.saltoDoble = 170;
    this.saltoTimer = null;
    this.gravedadTimer = null;

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    this.groundY = 600 - this.height + 30;
    this.y = this.groundY;
    this.actualizarPosicion();

    this.movementInterval = null;
  }

  loop() {
    if (!this.movementInterval) {
      this.movementInterval = setInterval(() => {
        if (juego.gameStarted && !juego.gameOver) {
          if (this.rightPressed) {
            this.x = Math.min(this.x + this.velocidad, 1200 - this.width);
          }
          if (this.leftPressed) {
            this.x = Math.max(this.x - this.velocidad, 0);
          }
          this.actualizarPosicion();
        }
      }, 20);
    }
  }

  stopMoving() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);
    this.rightPressed = false;
    this.leftPressed = false;
    this.spacePressed = false;
  }

  mover(e) {
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowLeft") this.leftPressed = true;
    if (juego.gameStarted && !juego.gameOver && e.code === "Space" && this.jumpCount < 2 && !this.spacePressed) {
      this.spacePressed = true;
      this.saltar();
    }
  }

  finMover(e) {
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowLeft") this.leftPressed = false;
    if (e.code === "Space") this.spacePressed = false;
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.jumpCount++;
    const saltoAltura = this.jumpCount === 1 ? this.saltoSimple : this.saltoDoble;
    const targetY = this.y - saltoAltura;

    this.saltoTimer = setInterval(() => {
      if (this.y > targetY) {
        this.y -= 10;
        this.actualizarPosicion();
      } else {
        clearInterval(this.saltoTimer);
        this.caer();
      }
    }, 20);
  }

  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.gravedadTimer = setInterval(() => {
      this.y += 10;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.jumpCount = 0;
        clearInterval(this.gravedadTimer);
        this.gravedadTimer = null;
      }
      this.actualizarPosicion();
    }, 20);
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }

  aumentarTamano(aumentoPx) {
      this.width += aumentoPx;
      this.height += aumentoPx;

      this.y = this.groundY - (this.height - 100);
      this.actualizarPosicion();
      console.log(`¡Personaje ha crecido! Nuevo tamaño: ${this.width}x${this.height}px`);
  }
}

class Enemigo {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = Math.random() * (1200 - this.width - 100) + 100;
    this.y = 600 - this.height;

    this.element = document.createElement("div");
    this.element.classList.add("enemigo");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();
  }

  perseguir(targetX, velocidad = 2) {
    if (this.x < targetX) this.x += velocidad;
    else if (this.x > targetX) this.x -= velocidad;
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

class Enemigo2 {
  constructor() {
    this.width = 48;
    this.height = 48;
    this.x = Math.random() * (1200 - this.width);
    this.y = -this.height;
    this.velocidadCaida = Math.random() * 2 + 1;

    this.element = document.createElement("div");
    this.element.classList.add("enemigo2");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    const orbImages = [
      "assets/orb1.png",
      "assets/orb2.png",
      "assets/orb3.png",
      "assets/orb4.png"
    ];
    const randomImage = orbImages[Math.floor(Math.random() * orbImages.length)];
    this.element.style.backgroundImage = `url("${randomImage}")`;
    this.element.style.backgroundSize = "cover";
    this.element.style.backgroundPosition = "center";
    this.element.style.backgroundRepeat = "no-repeat";

    this.actualizarPosicion();
  }

  loop() {
    setInterval(() => {
      if (juego.gameStarted && !juego.gameOver) {
        this.caer();
      }
    }, 50);
  }

  caer() {
    const gameContainerHeight = 600;

    this.y += this.velocidadCaida;

    if (this.y > gameContainerHeight) {
      this.resetearPosicion();
    }
    this.actualizarPosicion();
  }

  resetearPosicion() {
    this.x = Math.random() * (1200 - this.width);
    this.y = -this.height;
    this.velocidadCaida = Math.random() * 2 + 1;
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

const juego = new Game();