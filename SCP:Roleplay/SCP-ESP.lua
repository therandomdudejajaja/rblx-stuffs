local player = game.Players.LocalPlayer 
local screenGui = Instance.new("ScreenGui", player.PlayerGui)

local function createHighlight(instance)
    -- Create a red highlight
    local highlight = Instance.new("Highlight")
    highlight.FillColor = Color3.fromRGB(255, 0, 0) -- Red color
    highlight.OutlineColor = Color3.fromRGB(255, 0, 0) -- Red outline
    highlight.Adornee = instance
    highlight.Parent = instance
end

local function createLabel(instance)
    -- Create a TextLabel for visibility through walls
    local textLabel = Instance.new("TextLabel")
    textLabel.Size = UDim2.new(0, 200, 0, 50) -- Adjust size as needed
    textLabel.Position = UDim2.new(0.5, -100, 0, 20) -- Position near the top of the screen
    textLabel.Text = instance.Name
    textLabel.TextColor3 = Color3.fromRGB(0, 0, 0) -- Black text
    textLabel.BackgroundTransparency = 1 -- Transparent background
    textLabel.TextStrokeTransparency = 0 -- Visible outline
    textLabel.TextStrokeColor3 = Color3.fromRGB(255, 255, 255) -- White outline
    textLabel.Parent = screenGui

    -- Update position of the label to follow the model's position
    local runService = game:GetService("RunService")
    runService.RenderStepped:Connect(function()
        if instance:IsA("Model") and instance.PrimaryPart then
            local camera = workspace.CurrentCamera
            local screenPosition, onScreen = camera:WorldToScreenPoint(instance.PrimaryPart.Position)
            if onScreen then
                textLabel.Position = UDim2.new(0, screenPosition.X - 100, 0, screenPosition.Y - 25)
            else
                textLabel.Position = UDim2.new(0.5, -100, 0, 20) -- Reset to top if not on screen
            end
        elseif instance:IsA("Part") then
            local camera = workspace.CurrentCamera
            local screenPosition, onScreen = camera:WorldToScreenPoint(instance.Position)
            if onScreen then
                textLabel.Position = UDim2.new(0, screenPosition.X - 100, 0, screenPosition.Y - 25)
            else
                textLabel.Position = UDim2.new(0.5, -100, 0, 20) -- Reset to top if not on screen
            end
        end
    end)

    return textLabel -- Return the label in case we want to manage it later
end

local function highlightModels()
    local scpsFolder = game.Workspace:FindFirstChild("SCPs")
    if not scpsFolder then
        warn("SCPs folder not found!")
        return
    end

    for _, model in pairs(scpsFolder:GetChildren()) do
        if model:IsA("Model") then
            if model.Name == "SCP-079" then
                -- Highlight the specific part of SCP-079
                local specificPart = model:FindFirstChild("SCP-079_1") -- Highlighting SCP-079_1 part
                if specificPart then
                    createHighlight(specificPart)
                    createLabel(specificPart)
                else
                    warn("Specific part 'SCP-079_1' not found in SCP-079")
                end
            else
                -- Highlight the whole model for other SCPs
                createHighlight(model)
                createLabel(model)
            end
        elseif model:IsA("Folder") then
            for _, child in pairs(model:GetChildren()) do
                if child:IsA("Model") then
                    -- Similar handling for child models in folders
                    if child.Name == "SCP-079" then
                        local specificPart = child:FindFirstChild("SCP-079_1") -- Highlighting SCP-079_1 part
                        if specificPart then
                            createHighlight(specificPart)
                            createLabel(specificPart)
                        else
                            warn("Specific part 'SCP-079_1' not found in SCP-079")
                        end
                    else
                        createHighlight(child)
                        createLabel(child)
                    end
                end
            end
        end
    end
end

highlightModels()
