/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"


import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    afterEach(() => {
      jest.clearAllMocks()
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH["Bills"])
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList).toContain("active-icon")

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I am on Bills Page and I click on a icon eye", () => {

    afterEach(() => {
      jest.clearAllMocks()
    })

    test("Then a modal should open", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: [bills[0]] })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null

      const billsInstance = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      const eyes = screen.getByTestId("icon-eye")
      expect(eyes).toBeTruthy()
      const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye(eyes))
      eyes.addEventListener('click', handleClickIconEye)
      
      userEvent.click(eyes)
      expect(handleClickIconEye).toHaveBeenCalled()

    })
  })

  describe("When I am on Bills Page and I click on New Bills button", () => {

    afterEach(() => {
      jest.clearAllMocks()
    })

    test("Then I'm sent to New Bill Page", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null

      const billsInstance = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: bills })
      const newBillBtn = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)
      newBillBtn.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled()
      const pageTitle = screen.getByText("Envoyer une note de frais")
      expect(pageTitle).toBeTruthy()
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy()
    })
  })
})
