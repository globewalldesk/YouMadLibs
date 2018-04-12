class CreateMadlibs < ActiveRecord::Migration[5.2]
  def self.up
    create_table :madlibs do |t|
      t.string :title
      t.string :description
      t.string :author
      t.text :ml_text
      t.timestamps
    end
  end

  def self.down
    drop_table :madlibs
  end
end