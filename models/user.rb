class User < ActiveRecord::Base
  include BCrypt
  validates :username, uniqueness: true
  def authenticate(attempted_password)
    if self.password == attempted_password
      true
    else
      false
    end
  end
end