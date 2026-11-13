from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class LoginPage(BasePage):
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    BTN_LOGIN = (By.XPATH, "//button[@type='submit']")

    def iniciar_sesion(self, base_url, email, password):
        self.open(f"{base_url}/login")
        self.type_text(self.EMAIL_INPUT, email)
        self.type_text(self.PASSWORD_INPUT, password)
        self.click(self.BTN_LOGIN)

        self.wait.until(lambda d: "/login" not in d.current_url)