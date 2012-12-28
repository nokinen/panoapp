class CreatePanoramas < ActiveRecord::Migration
  def change
    create_table :panoramas do |t|
      t.string :preview
      t.string :fullsize

      t.timestamps
    end
  end
end
