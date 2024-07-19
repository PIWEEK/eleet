const MODEL_URL = "http://localhost:11434/api/generate"

export class AIGenerator {

  static generatePlanetDescription(name, terrain, climate, civilization) {
    const prompt = `Descripción de un planeta de ciencia ficción llamado ${name}, ${terrain}, con un clima ${climate}. ` +
                    `Con una civilización ${civilization}. No indiques ciudades. Con un máximo de 100 palabras. En español. Omite el título.`
    return this.#sendPrompt(prompt)
  }

  static #sendPrompt(prompt) {
    const request = new Request(MODEL_URL, {
        method: "POST",
        body: JSON.stringify({
            "model": "llama3",
            "prompt": prompt,
            "stream": false
        })
    })

    return fetch(request)
        .then((response) => {
            if (response.ok) {
                return response.json().then((js) => js.response)
            } else {
                throw new Error("Cannot fetch from AI model")
            }
        })
  }
}