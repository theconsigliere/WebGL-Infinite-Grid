import { infiniteScroll } from "./modules/infiniteScroll"

const container = document.getElementById("container")

const SRCs = [
  "https://images.unsplash.com/photo-1549888497-d378bfc66c57?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
  "https://images.unsplash.com/photo-1550836473-62bccbd3d8e8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80",
  "https://images.unsplash.com/photo-1549365414-dcde6b449bfb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=701&q=80",
  "https://images.unsplash.com/photo-1550803829-34e62702d5bb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80",
  "https://images.unsplash.com/photo-1550874169-217f9512d977?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80",
]

const app = new infiniteScroll(SRCs)
app.mount(container)
app.draw()
app.render()

window.addEventListener("mousedown", function (e) {
  app.onMouseDown(e.clientY)
})

window.addEventListener("mousemove", function (e) {
  app.onMouseMove(e.clientY)
})

window.addEventListener("mouseup", function (e) {
  app.onMouseUp(e.clientY)
})

window.addEventListener("resize", function () {
  app.onResize()
})
