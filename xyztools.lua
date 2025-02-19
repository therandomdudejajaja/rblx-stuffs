local player = game.Players.LocalPlayer
local mouse = player:GetMouse()

-- Create a ScreenGui and TextBox for rotation speed input
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "RotationGui"
screenGui.Parent = player:WaitForChild("PlayerGui")

local textBox = Instance.new("TextBox")
textBox.Size = UDim2.new(0, 200, 0, 50)
textBox.Position = UDim2.new(0, 10, 1, -60)  -- bottom left corner
textBox.Text = "5"  -- default rotation speed (degrees per second)
textBox.ClearTextOnFocus = false
textBox.Parent = screenGui

-- Remove the GUI when the character dies
local function onCharacterAdded(character)
    local humanoid = character:WaitForChild("Humanoid")
    humanoid.Died:Connect(function()
        screenGui:Destroy()
    end)
end

if player.Character then
    onCharacterAdded(player.Character)
end
player.CharacterAdded:Connect(onCharacterAdded)

-- Function to create a rotation tool for a given axis
local function createRotationTool(axis)
    local tool = Instance.new("Tool")
    tool.Name = "Rotate" .. axis
    tool.RequiresHandle = false
    tool.Parent = player:WaitForChild("Backpack")
    
    tool.Activated:Connect(function()
        local target = mouse.Target
        if target and target:IsA("BasePart") and not target.Anchored then
            -- Get rotation speed from the TextBox (in degrees per second)
            local speed = tonumber(textBox.Text) or 5
            local angularSpeed = math.rad(speed)  -- convert to radians per second

            -- Check if the part already has a BodyAngularVelocity
            local rotator = target:FindFirstChild("BodyAngularVelocity")
            if not rotator then
                rotator = Instance.new("BodyAngularVelocity")
                rotator.Name = "BodyAngularVelocity"
                rotator.Parent = target
                rotator.MaxTorque = Vector3.new(1e99, 1e99, 1e99)  -- Allow torque on all axes
            end

            -- Update AngularVelocity by adding the new rotation
            if axis == "X" then
                rotator.AngularVelocity = rotator.AngularVelocity + Vector3.new(angularSpeed, 0, 0)
            elseif axis == "Y" then
                rotator.AngularVelocity = rotator.AngularVelocity + Vector3.new(0, angularSpeed, 0)
            elseif axis == "Z" then
                rotator.AngularVelocity = rotator.AngularVelocity + Vector3.new(0, 0, angularSpeed)
            end
        end
    end)
end

-- Create tools for X, Y, and Z rotation
createRotationTool("X")
createRotationTool("Y")
createRotationTool("Z")

-- Create a tool to remove the BodyAngularVelocity
local removalTool = Instance.new("Tool")
removalTool.Name = "RemoveRotation"
removalTool.RequiresHandle = false
removalTool.Parent = player:WaitForChild("Backpack")

removalTool.Activated:Connect(function()
    local target = mouse.Target
    if target and target:IsA("BasePart") then
        local rotator = target:FindFirstChild("BodyAngularVelocity")
        if rotator then
            rotator:Destroy()
        end
    end
end)
