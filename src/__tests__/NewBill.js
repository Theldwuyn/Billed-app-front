/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from "@testing-library/user-event"
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I upload a file which type is not jpg, jpeg or png", () => {
    test("Then an alert window should be displayed and the input should remain empty", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})

      jest.spyOn(window, 'alert').mockImplementation(() => {})
      const inputFile = screen.getByTestId("file")
      const file = new File(["foo"], "foo.pdf", {type: 'application/pdf'})
      userEvent.upload(inputFile, file)
      expect(inputFile.value).toBe("")
      expect(window.alert).toHaveBeenCalledWith("Format du fichier invalide, veuillez sélectionner un fichier au format jpg, jpeg ou png")
    })
  })
})
